var players_online = 0;

var players = [];
var players_in_search = [];
var rooms = [];

var collection;

var https = require('https');
var fs = require('fs')
var cors = require('cors');
var corsOptions = {
	origin: 'https://sturdyduck.github.io'
}
var app = require('express')();
app.use(cors());
app.options('*', cors());

var server = https.createServer({
	key: fs.readFileSync('/var/www/smetanka.hopto.org/smetanka.key'),
	cert: fs.readFileSync('/etc/ssl/certs/smetanka_hopto_org.pem-chain')
}, app);
server.listen(1337);

var io = require('socket.io')(server, { 
	access: '*',
	origins: '*',
	allowEIO3: true
	});

io.sockets.on('connect', function (socket) {
    players_online++;
    var client = socket;

    players.push(socket);
    console.log('Client connected.');
    console.log(players_online + ' players at all. \n');
    console.log();

    socket.on('disconnect', function (socket) {
        players_online--;
        p_index = players.indexOf(socket);
        if (p_index != -1) {
            players.splice(p_index, 1);
        }
        console.log('Client disconnected.');
        console.log(players_online + ' players at all. \n');
    })

    socket.on('go_search', function (socket) {
        players_in_search.push(client);
        console.log('insearch: ' + players_in_search.length + '\n');
    })

    socket.on('stop_search', function (socket) {
        unsearch(socket);
    })

    socket.on('login', function(data) {
        collection.findOne({"login_lower_case": data[0], "pass": data[1]}, function(err, doc) {
            if (doc == null) {
                login_response = "Incorrect";
            }
            else {
                var client_index = players.indexOf(client);
                players[client_index].client_login = doc.login_lower_case;
                client_login = doc.login_lower_case;
                login_response = {
                    login: doc.login,
                    pass: doc.pass,
                    online_plays: doc.OnlineGames,
                    online_wins: doc.OnlineWins,
                    aliens_kill_count: doc.AliensKillCount
                };
            }
            socket.emit("login receive", login_response);
        })
    })

    socket.on('register', function(data) {
        var reason;

        collection.findOne({"login_lower_case": data[1]}, function (err, doc) {
            if (doc != null) {
                reason = ["Аккаунт с таким именем уже существует.", "This login is already taken"];
                socket.emit('registration failed', reason);
                return;
            }
    
            collection.insertOne({"login": data[0], "login_lower_case": data[1], "pass": data[2], "OnlineGames": 0, "OnlineWins": 0, "AliensKillCount": 0});
            if (collection.findOne({"login": data[0], "pass": data[1]}) != null) {
                socket.emit('registration confirmed');
            }
            else {
                reason = ["Неизвестная ошибка.", "Unknown error"];
                socket.emit('registration failed', reason);
            }
        })
    })

    socket.on('Singleplayer increase kill count', function(amount) {
        var client_index = players.indexOf(client);
        IncreaseStat(players[client_index].client_login, "AliensKillCount", amount);
    })
});

init_server();
init_DB();
setInterval(function () {
    update_rooms();
}, 10);

function init_DB() {
    try {
        var MongoClient = require("mongodb").MongoClient;
        var mongo = new MongoClient("mongodb://localhost:27017/");
        mongo.connect(function (err, client) {
            if (err) {
                return console.log(err);
            }
        })

        var db = mongo.db("users");
        collection = db.collection("users");
        
        
        console.log("MongoDB initialized");
    }
    catch (err) {
        console.log(err);
    }
}


function init_server() {
    send_players_online();
    search_check();
}

function send_players_online() {
    players.forEach(function (item, i, arr) {
        item.emit('players online changed', players_online);
    })
    setTimeout(send_players_online, 2000);
}

function get_free_id() {
    var id = 2;
    used_ids = [];

    players.forEach(function (item, i, arr) {
        used_ids.push(item.id);
    })

    while (used_ids.indexOf(id) != -1) {
        id++;
    }
    return id;
}

function create_room(p1, p2) {
    var room = {
    }

    // Create players ships
    var ships = init_ships(p1, p2);
    room.ship1 = ships[0];
    room.ship2 = ships[1];

    // Create round params
    var params = {
        extras_length: 15000, // in ms
        started: false,
        ayy_spawn_interval: 15000, // in Milliseconds
        ayy_timer: 0,
        ayy_speed: 1,
        players_kill_count: [0, 0]
    }
    room.params = params;

    // Create other ingame stuff
    room.bullets = [];

    room.extras = [];

    room.ayy_fleet = [];

    // Link sockets
    var players = [p1, p2];
    room.players = players;

    rooms.push(room);

    for (let i = 0; i < players.length; i++) {
        IncreaseStat(room.players[i].client_login, "OnlinePlays", 1);
    };

    // Add emits
    p1.on('ready', function () {
        room.ship1.ready_pressed = true;
        room_ready_check(room);
    })
    p2.on('ready', function () {
        room.ship2.ready_pressed = true;
        room_ready_check(room);
    })

    p1.on('ready timer end', function () {
        room.players[0].ready_to_play = true;
        room_ready_to_play_check(room);
    })
    p2.on('ready timer end', function () {
        room.players[1].ready_to_play = true;
        room_ready_to_play_check(room);
    })

    p1.on('send direction', function (direction) {
        room.ship1.direction = direction;
    })
    p2.on('send direction', function (direction) {
        room.ship2.direction = -direction;
    })

    p1.on('send shoot', function () {
        shoot("ship1_img", ships[0].x + 33, ships[0].y);
    })
    p2.on('send shoot', function () {
        shoot("ship2_img", ships[1].x + 34, ships[1].y + 77);
    })

    // Game functions

    function shoot(ship, x, y) {
        var cs = can_shoot(ship);
        var bullet_speed = 10;
        var bullets = room.bullets;
        var ship1 = room.ship1;
        var ship2 = room.ship2;

        if (ship == "ship1_img") {
            bullet_speed = ship1.bullet_speed;
        }
        else {
            bullet_speed = ship2.bullet_speed;
        }

        if (cs == true) {
            var bullet = {
                x_pos: x,
                y_pos: y,
                owner: ship,
                speed: bullet_speed,
                super_bullet: false,
                stealth_bullet: false
            };

            if (bullet.owner == "ship1_img") {
                if (ship1.extras[3] > 0) {
                    bullet.super_bullet = true;
                }
                if (ship1.extras[5] > 0) {
                    bullet.stealth_bullet = true;
                }
            }
            else if (bullet.owner == "ship2_img") {
                if (ship2.extras[3] > 0) {
                    bullet.super_bullet = true;
                }
                if (ship2.extras[5] > 0) {
                    bullet.stealth_bullet = true;
                }
            }

            bullets.push(bullet);
            send_sound(room, 'pew');
        }

        bullets.sort((prev, next) => {
            if (prev.x_pos < next.x_pos) return -1;
            if (prev.x_pos > next.x_pos) return 1;
        });
    }

    function can_shoot(ship) {

        if (room.params.started == false) {
            return false;
        }

        var bullets = room.bullets;
        var ship1 = room.ship1;
        var ship2 = room.ship2;
        var ship_bullets = 0;
        var bullets_ran_out = false;
        for (var i = 0; i < bullets.length; i++) {
            if (bullets[i].owner == ship) {
                ship_bullets++;
            }
        }
        if (ship == "ship1_img") {
            if (ship1.bullets_limit <= ship_bullets) {
                bullets_ran_out = true;
            }
        }
        else if (ship == "ship2_img") {
            if (ship2.bullets_limit <= ship_bullets) {
                bullets_ran_out = true;
            }
        }

        if (room.started == false) {
            return false;
        }
        else if (bullets_ran_out == true) {
            return false;
        }
        else if (!ship1.alive || !ship2.alive) {
            return false;
        }
        return true;
    }

    function ayy_timer_increase() {
        if (room.params.started && (room.ship1.lifes > 0 && room.ship2.lifes > 0)) {
            room.params.ayy_timer += room.params.ayy_spawn_interval / 360;
            if (room.params.ayy_timer >= room.params.ayy_spawn_interval) {
                add_fleet();
                room.params.ayy_timer = 0;
            }
        }
        if (room.ship1.lifes > 0 && room.ship2.lifes > 0) {
            setTimeout(ayy_timer_increase, room.params.ayy_spawn_interval / 360);
        }
    }

    function add_fleet() {
        for (var i = 0; i < 10; i++) {
            var ayy_space = (1024 - (61 * 10)) / 10;
            var alien = {
                owner: "ship1_img",
                x_pos: (61 * i) + (ayy_space * i),
                y_pos: (768 / 2) + (65 / 2),
                engines_frame: 1,
                dir: 1
            };
            if (i == 0) {
                alien.x_pos += ayy_space / 2;
            }
            if (i % 2 == 1) {
                alien.owner = "ship2_img";
                alien.y_pos -= 65 * 2;
                alien.dir = -1;
            }

            room.ayy_fleet.push(alien);
        }
        room.params.ayy_speed += 0.2;
        send_sound(room, 'new fleet')
    }

    function extras_timer() {
        for (var i = 0; i < room.ship1.extras.length; i++) {
            if (room.ship1.extras[i] > 0) {
                room.ship1.extras[i] -= 50;
            }
            if (room.ship2.extras[i] > 0) {
                room.ship2.extras[i] -= 50;
            }
        }
        setTimeout(extras_timer, 50);
    }

    // Tell second player he is second
    p2.emit('you second player');

    // Start game
    p1.emit('start mp game', room.ship1, room.ship2);
    
    p2.emit('start mp game', room.ship2, room.ship1);

    // Functions activating
    ayy_timer_increase();
    extras_timer();
}

function search_check() {
    if (players_in_search.length >= 2) {
        create_room(players_in_search[0], players_in_search[1]);
        unsearch(players_in_search[0]);
        unsearch(players_in_search[1]);
        console.log("\nRoom created.");
        console.log("Rooms amount: " + rooms.length);
        console.log();
    }
    setTimeout(search_check, 1000);
}

function unsearch(player) {
    var index = players_in_search.indexOf(player);
    players_in_search.splice(index, 1);
    console.log('insearch: ' + players_in_search.length);
}

console.log('Server started. \n');



function init_ships(p1, p2) {
    // Init both ships and return them in array

    var ship1 = {
        lifes: 3,
        x: 1024 / 2,
        y: 768 - (30 + 84),
        engines_frame: 1,
        go_left: false,
        go_right: false,
        direction: 0,
        shooting: false,
        alive: true,
        bullets_limit: 1,
        speed: 10,
        bullet_speed: 10,
        extras: [0, 0, 0, 0, 0, 0],
        shield: false,
        ready_pressed: false,
        ready_to_play: false
    }

    var ship2 = {
        lifes: 3,
        x: 1024 / 2,
        y: 30,
        engines_frame: 1,
        go_left: false,
        go_right: false,
        direction: 0,
        shooting: false,
        alive: true,
        bullets_limit: 1,
        speed: 10,
        bullet_speed: 10,
        extras: [0, 0, 0, 0, 0, 0],
        shield: false,
        ready_pressed: false,
        ready_to_play: false
    }

    var ships = [ship1, ship2];
    return ships;
}

function send_info(room, data) {
    room.players[0].emit('data receive', data);

    // invert ships
    /* var ship = data.ship1;
    data.ship1 = data.ship2;
    data.ship2 = ship; */
    //

    room.players[1].emit('data receive', data);
}

function update_rooms() {
    // my code is trash

    // check ready
    rooms.forEach(room => {
        var data = {};

        // reducts
        var ship1 = room.ship1;
        var ship2 = room.ship2;
        var players = room.players;
        var ayy_fleet = room.ayy_fleet;
        var extras = room.extras;
        var bullets = room.bullets;
        var ship1_x2 = room.ship1_x2;
        var ship1_y2 = room.ship1_y2;
        var ship2_x2 = room.ship2_x2;
        var ship2_y2 = room.ship2_y2;
        var extras_length = room.params.extras_length;
        var started = room.params.started;
        var ayy_spawn_interval = room.params.ayy_spawn_interval; // in Milliseconds
        var ayy_timer = room.params.ayy_timer;
        var ayy_speed = room.params.ayy_speed;
        var players_kill_count = room.params.players_kill_count;
        //

        round_update();


        function update_ships_coords2() {
            room.ship1_x2 = get_x2(room.ship1.x, room.ship1_img);
            room.ship1_y2 = get_y2(room.ship1.y, room.ship1_img);
            room.ship2_x2 = get_x2(room.ship2.x, room.ship2_img);
            room.ship2_y2 = get_y2(room.ship2.y, room.ship2_img);
        }

        function round_update() {

            bullets_update();
            update_ships_coords2();
            update_fleet();
            update_loot();
            extras_end_check();
            check_win();

            if ((ship1.x + (ship1.direction * ship1.speed) >= 0) && (ship1_x2 + (ship1.direction * ship1.speed) <= 1024) && started) {
                ship1.x += (ship1.direction * ship1.speed);
            }
            if ((ship2.x + (ship2.direction * ship2.speed) >= 0) && (ship2_x2 + (ship2.direction * ship2.speed) <= 1024 && started)) {
                ship2.x += (ship2.direction * ship2.speed);
            }

            if (ship1.alive == false || ship2.alive == false) {
                setTimeout(function () {
                    round_restart();
                }, 1000);
            }
        }

        function bullets_update() {
            room.bullets.forEach(function (item, i, arr) {
                if (item.owner == "ship1_img") {
                    item.y_pos -= item.speed;
                }
                else {
                    item.y_pos += item.speed;
                }

                // Collide check (size of bullet - 6x25)
                if (item.x_pos >= ship1.x && item.x_pos + 6 <= ship1_x2 &&
                    item.y_pos >= ship1.y && item.y_pos + 25 <= ship1_y2) {
                    if (item.owner == "ship2_img" && ship1.alive) {
                        if (ship1.shield == true) {
                            ship1.shield = false;
                        }
                        else {
                            ship_die("ship1_img");
                        }
                        if (item.super_bullet == false) {
                            bullets.splice(i, 1);
                        }
                    }
                }
                else if (item.x_pos >= ship2.x && item.x_pos + 6 <= ship2_x2 &&
                    item.y_pos >= ship2.y && item.y_pos + 25 <= ship2_y2) {
                    if (item.owner == "ship1_img" && ship2.alive) {
                        if (ship2.shield == true) {
                            ship2.shield = false;
                        }
                        else {
                            ship_die("ship2_img");
                        }
                        if (item.super_bullet == false) {
                            bullets.splice(i, 1);
                        }
                    }
                }
                else if (item.y_pos < 0 || item.y_pos + 25 > 768) {
                    bullets.splice(i, 1);
                }

                // Aliens fleet collide check
                ayy_fleet.forEach(function (item2, i2, arr2) {
                    if (item.x_pos + 6 >= item2.x_pos && item.x_pos <= item2.x_pos + 61 &&
                        item.y_pos <= item2.y_pos + 65 && item.y_pos + 25 >= item2.y_pos) {
                        if (item.super_bullet == false) {
                            bullets.splice(i, 1);
                        }
                        ayy_fleet.splice(i2, 1);
                        send_sound(room, 'boom');
                        drop_loot(item.owner, item2.x_pos, item2.y_pos);
                        if (item.owner == "ship1_img") {
                            players_kill_count[0]++;
                        }
                        else {
                            players_kill_count[1]++;
                        }
                    }
                })
            });
            data.bullets = room.bullets;
        }

        function getRandomInt(max) {
            return Math.floor(Math.random() * Math.floor(max));
        }

        function round_restart() {
            var lifes = [ship1.lifes, ship2.lifes];
            round_vars_restore();
            ship1.lifes = lifes[0];
            ship2.lifes = lifes[1];

            players.forEach(player => {
                player.ready_to_play = false;
                player.emit('ready reset');
            });

            ship1.ready_pressed = false;
            ship2.ready_pressed = false;

            room.params.started = false;
        }

        function round_vars_restore() {
            var ships = [ship1, ship2];

            ships.forEach(ship => {
                ship.engines_frame = 1;
                ship.go_left = false;
                ship.go_right = false;
                ship.direction = 0;
                ship.shooting = false;
                ship.alive = true;
                ship.bullets_limit = 1;
                ship.speed = 10;
                ship.bullet_speed = 10;
                ship.extras = [0, 0, 0, 0, 0, 0];
                ship.shield = false;
            });

            room.ship1.x = 1024 / 2;
            room.ship1.y = 768 - (30 + 84);

            room.ship2.x = 1024 / 2;
            room.ship2.y = 30;

            room.bullets = [];
            room.extras = [];
            room.extras_length = 15000; // in ms
            room.params.started = false;
            room.params.ayy_spawn_interval = 15000; // in Milliseconds
            room.params.ayy_timer = 0;
            room.ayy_fleet = [];
            room.params.ayy_speed = 1;
        }

        function update_fleet() {
            ayy_fleet.forEach(function (item, i, arr) {
                if (item.x_pos < 10 || 1024 - (item.x_pos + 61) < 10) {
                    if (item.owner == "ship1_img") {
                        item.y_pos += 65 + 5 + 20;
                    }
                    else {
                        item.y_pos -= 61 + 5 + 20;
                    }
                    item.dir = -item.dir;

                    if (item.y_pos < ship2_y2 && ship2.alive) {
                        room.ayy_fleet = [];
                        ship_die("ship2_img");
                    }
                    else if (item.y_pos > ship1.y && ship1.alive) {
                        room.ayy_fleet = [];
                        ship_die("ship1_img");
                    }
                }

                item.x_pos += ayy_speed * item.dir;
            })
            data.ayy_fleet = room.ayy_fleet;
        }

        function drop_loot(owner, x, y) {
            var drop_chance = Math.floor(Math.random() * Math.floor(100));
            if (drop_chance >= 75) {
                drop_chance = Math.floor(Math.random() * Math.floor(100)); // gen new rand
        
                if (drop_chance <= 25) { // Вернуть на 25
                    // 3x bullet
                    drop_extra(owner, "3x_bullets", 0, "green", x, y);
                }
                else if (drop_chance <= 45) { // вернуть на 45
                    // 2x bullet speed
                    drop_extra(owner, "2x_bullets_speed", 1, "green", x, y);
                }
                else if (drop_chance <= 70) { // вернуть на 70
                    // 2x ship speed
                    drop_extra(owner, "2x_ship_speed", 2, "green", x, y);
                }
                else if (drop_chance <= 90) { // вернуть на 90
                    // extra life
                    drop_extra(owner, "extra_life", 6, "purple", x, y);
                }
                else if (drop_chance <= 92.5) { // вернуть на 92.5
                    // shield
                    drop_extra(owner, "shield", 7, "purple", x, y);
                }
                else if (drop_chance <= 95) { // вернуть на 95
                    // super-bullet
                    drop_extra(owner, "super_bullets", 3, "gold", x, y);
                }
                else if (drop_chance <= 97.5) { //вернуть на 97.5
                    // invision
                    drop_extra(owner, "invision", 4, "gold", x, y);
                }
                else {
                    // half-invis bullets
                    drop_extra(owner, "stealth_bullets", 5, "gold", x, y);
                }
            }
        }

        function drop_extra(owner, name, image, circle_color, x, y) {
            var extra = {
                owner: owner,
                name: name,
                image: image,
                circle_color: circle_color,
                dir: 0,
                x_pos: x,
                y_pos: y
            }
            if (owner == "ship1_img") {
                extra.dir = 1;
            }
            else {
                extra.dir = -1;
            }
            extras.push(extra);
        }

        function update_loot() {
            extras.forEach(function (item, i, arr) {
                item.y_pos += 5 * item.dir;
                if ((item.y_pos >= ship1.y && item.y_pos <= ship1_y2 &&       // Bonus collide any ship
                    item.x_pos + 20 > ship1.x && item.x_pos < ship1_x2) ||
                    (item.y_pos >= ship2.y && item.y_pos <= ship2_y2 &&
                        item.x_pos + 20 > ship2.x && item.x_pos < ship2_x2)) {
                    extras.splice(i, 1);
                    give_extra(item.name, item.owner);
                }
                // bonus leave map
                if (item.y_pos > 768 || item.y_pos < 0) {
                    extras.splice(i, 1);
                }
            })
            data.extras = extras;
        }

        function give_extra(name, owner) {
            if (owner == "ship1_img") {
                switch (name) {
                    case "3x_bullets":
                        room.ship1.bullets_limit = 3;
                        room.ship1.extras[0] = room.params.extras_length;
                        break;
                    case "2x_bullets_speed":
                        room.ship1.bullet_speed = 20;
                        room.ship1.extras[1] = room.params.extras_length;
                        break;
                    case "2x_ship_speed":
                        room.ship1.speed = 15;
                        room.ship1.extras[2] = room.params.extras_length;
                        break;
                    case "extra_life":
                        if (room.ship1.lifes < 3) {
                            room.ship1.lifes++;
                        }
                        break;
                    case "shield":
                        room.ship1.shield = true;
                        break;
                    case "super_bullets":
                        room.ship1.extras[3] = room.params.extras_length;
                        break;
                    case "invision":
                        room.ship1.extras[4] = room.params.extras_length;
                        break;
                    case "stealth_bullets":
                        room.ship1.extras[5] = room.params.extras_length;
                        break;
                }
                players[0].emit('play sound', 'get extra');
            }
            else {
                switch (name) {
                    case "3x_bullets":
                        room.ship2.bullets_limit = 3;
                        room.ship2.extras[0] = room.params.extras_length;
                        break;
                    case "2x_bullets_speed":
                        room.ship2.bullet_speed = 20;
                        room.ship2.extras[1] = room.params.extras_length;
                        break;
                    case "2x_ship_speed":
                        room.ship2.speed = 15;
                        room.ship2.extras[2] = room.params.extras_length;
                        break;
                    case "extra_life":
                        if (room.ship2.lifes < 3) {
                            room.ship2.lifes++;
                        }
                        break;
                    case "shield":
                        room.ship2.shield = true;
                        break;
                    case "super_bullets":
                        room.ship2.extras[3] = room.params.extras_length;
                        break;
                    case "invision":
                        room.ship2.extras[4] = room.params.extras_length;
                        break;
                    case "stealth_bullets":
                        room.ship2.extras[5] = room.params.extras_length;
                        break;
                }
                players[1].emit('play sound', 'get extra');
            }
        }

        function extras_end_check() {
            // ship1_img
            if (ship1.extras[0] == 0) {
                ship1.bullets_limit = 1;
            }
            if (ship1.extras[1] == 0) {
                ship1.bullet_speed = 10;
            }
            if (ship1.extras[2] == 0) {
                ship1.speed = 10;
            }

            // ship2_img
            if (ship2.extras[0] == 0) {
                ship2.bullets_limit = 1;
            }
            if (ship2.extras[1] == 0) {
                ship2.bullet_speed = 10;
            }
            if (ship2.extras[2] == 0) {
                ship2.speed = 10;
            }
        }

        function check_win() {
            function DbIncreaseWins(player) {
                IncreaseStat(room.players[player].client_login, "OnlineWins", 1);
                for (let i = 0; i < 2; i++) {
                    IncreaseStat(room.players[i].client_login, "AliensKillCount", players_kill_count[i]);
                }
            }

            if (room.players[0].disconnected) {
                room.players[1].emit('end game', true);
                DbIncreaseWins(1);
                kill_room(room);
            }
            else if (room.players[1].disconnected) {
                room.players[0].emit('end game', true);
                DbIncreaseWins(0);
                kill_room(room);
            }

            if (ship1.lifes == 0 || ship2.lifes == 0) {
                if (ship1.lifes == 0) {
                    players[0].emit('end game', false);
                    players[1].emit('end game', true);
                    DbIncreaseWins(1);
                }
                else {
                    players[0].emit('end game', true);
                    DbIncreaseWins(0);
                    players[1].emit('end game', false);
                }

                kill_room(room);
            }
        }

        function ship_die(ship) {
            if (ship == "ship1_img") {
                ship1.alive = false;
                ship1.lifes--;
            }
            else {
                ship2.alive = false;
                ship2.lifes--;
            }
            send_sound(room, 'boom');
        }

        function get_x2(x, img) {
            var x2 = x + 70;
            return x2;
        }
        function get_y2(y, img) {
            var y2 = y + 84;
            return y2;
        }

        function params_pack() {
            data.extras_length = extras_length;
            data.started = started;
            data.ayy_spawn_interval = ayy_spawn_interval;
            data.ayy_timer = ayy_timer;
            data.ayy_speed = ayy_speed;
        }
        
        data.ship1 = room.ship1;
        data.ship2 = room.ship2;
        params_pack();
        
        send_info(room, data);
        
    });
}

function room_ready_check(room) {
    if (room.ship1.ready_pressed && room.ship2.ready_pressed) {
        room.players[0].emit('players ready');
        room.players[1].emit('players ready');
    }
}

function room_ready_to_play_check(room) {
    if (room.players[0].ready_to_play && room.players[1].ready_to_play) {
        room.params.started = true;
    }
}

function send_sound(room, sound) {
    players.forEach(player => {
        player.emit('play sound', sound);
    });
}

function kill_room(room) {
    room_index = rooms.indexOf(room);
    if (room_index != -1) {
        rooms.splice(room_index, 1);
        console.log('Room closed.');
        console.log('Rooms amount: ' + rooms.length);
        console.log();
    }
}

function IncreaseStat(login, stat, amount) {
    if (amount == undefined) amount = 1;
    if (login == null) {
        return;
    }
    else {
        switch (stat) {
            case 'OnlinePlays':
                collection.updateOne({"login_lower_case": login}, {$inc: {"OnlineGames": amount}});
                break;
            case 'OnlineWins':
                collection.updateOne({"login_lower_case": login}, {$inc: {"OnlineWins": amount}});
                break;
            case 'AliensKillCount':
                collection.updateOne({"login_lower_case": login}, {$inc: {"AliensKillCount": amount}});
                break;
        }
    }
}