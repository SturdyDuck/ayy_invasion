var canv = document.getElementById("canv");
var ctx = canv.getContext('2d');

var press_here_fade_alpha = 1;
var press_here_pressed = false;

create_images();

function press_here() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);
    ctx.fillStyle = "white";
    ctx.font = "normal 30pt sans-serif";
    ctx.fillText("CLICK HERE", 400, 400);

    canv.onclick = press_here_fade_start;
}

function press_here_fade_start() {
    if (press_here_pressed == true) {
        return;
    }

    press_here_pressed = true;
    press_here_fade();
}
function press_here_fade() {

    if (press_here_fade_alpha <= 0) {
        setTimeout(init, 2000);
        setTimeout(initDraw, 2000);
        setTimeout(keyboard_add_events, 2000);
        return;
    }

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);
    ctx.fillStyle = "white";
    ctx.globalAlpha = press_here_fade_alpha;
    ctx.fillStyle = "white";
    ctx.font = "normal 30pt sans-serif";
    ctx.fillText("CLICK HERE", 400, 400);
    press_here_fade_alpha -= 0.005;
    ctx.globalAlpha = 1;
    setTimeout(press_here_fade, 13);
    return;
}

function init() {
    global_params_init();
    check_mouse();
    setTimeout(function () {
        started = false;
    }, 500);
    create_audio();

    play_menu_music();
}

function io_init() {
    try {
        socket = io.connect('https://smetanka.hopto.org:1337', {
			transports: ['websocket']
			});
    }
    catch (err) {
    }

    isSecondPlayer = false;

    socket.on('connect', function () {
        console.log('Connected to server');
    })

    socket.on('players online changed', function (p_online) {
        players_online = p_online;
    })

    socket.on('data receive', function (data) {
        mp_get_info(data);
    });

    socket.on('start mp game', function (ship1, ship2) {
        init_multiplayer(ship1, ship2);
    })

    socket.on('players ready', function () {
        mp_game_ready();
    })

    socket.on('you second player', function () {
        isSecondPlayer = true;
    })

    socket.on('end game', function (win) {
        radio.load();
        init();
        started = false;
        mp_ready = false;

        if (win == true) {
            alert('WINNER');
        }
        else {
            alert('LOOSER');
        }
	isSecondPlayer = false;
    })

    socket.on('ready reset', function () {
        mp_ready = false;
        ready_pressed = false;
        ready_timer_ms = 2999;
        started = false;
    })

    socket.on('play sound', function (sound) {
        mp_play_sound(sound);
    })
}

function initDraw() {
    requestAnimationFrame(draw);
    start_point_x = (canv.width / 2) - ingame_bg[0].width;
    start_point_y = (canv.height - ingame_bg[0].height) / 2;
}

function global_params_init() {
    inMenu = true;
    inSearch = false;
    bg_frame_num = 0;
    lang = "ru";
    mouse_on = "";
    selected_enemy = "ai";
    try {
        sounds = sounds;
    }
    catch (Error) {
        sounds = true;
    }

    players_online = 0;
}

function create_images() {
    // Тут все 'new Image()' и src
    bg_frames = []


    logo_img = new Image();
    logo_img.src = "images/menu_elements/logo.png";


    play_button = new Image();
    play_button_a = new Image();
    play_button.src = "images/menu_elements/play_button.png";
    play_button_a.src = "images/menu_elements/play_button_hover.png";


    ai_select = new Image();
    human_select = new Image();
    ai_select.src = "images/menu_elements/ai_select.png";
    human_select.src = "images/menu_elements/human_select.png";


    ru_flag = new Image();
    en_flag = new Image();
    ru_flag.src = "images/menu_elements/ru_flag.jpg";
    en_flag.src = "images/menu_elements/en_flag.png";

    sound_icon = new Image();
    mute_icon = new Image();
    sound_icon.src = "images/menu_elements/speaker.svg";
    mute_icon.src = "images/menu_elements/cross_sign.svg";
    sound_icon.widht = 50;
    sound_icon.height = 50;

    ship1_img = new Image();
    ship2_img = new Image();
    ship1_img.src = "images/ship.png";
    ship2_img.src = "images/ship2.png";

    ship1_engines = [new Image(), new Image()];
    ship1_engines[0].src = "images/ship1_engines1.png";
    ship1_engines[1].src = "images/ship1_engines2.png";
    ship2_engines = [new Image(), new Image()];
    ship2_engines[0].src = "images/ship2_engines1.png";
    ship2_engines[1].src = "images/ship2_engines2.png";

    ship_shield = new Image();
    ship_shield.src = "images/ship_shield.png";

    ship2_invis = new Image();
    ship2_invis.src = "images/ship_invis.png";

    life_img = new Image();
    life_img.src = "images/bonus/life.png";

    ingame_bg = [
        new Image()
    ];
    ingame_bg[0].src = "images/space/stations.png";

    ingame_bg_num = 0;

    bullet_img = new Image();
    bullet_img2 = new Image();
    bullet_img.src = "images/bullet.png";
    bullet_img2.src = "images/bullet2.png";

    ayy_img = new Image();
    ayy_img.src = "images/alien.png";
    ayy_engines = [new Image(), new Image];
    ayy_engines[0].src = "images/alien_engines1.png";
    ayy_engines[1].src = "images/alien_engines2.png";

    extra_imgs = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image()]
    extra_imgs[0].src = "images/bonus/3x_bullet.png";
    extra_imgs[1].src = "images/bonus/bullet_speed.png";
    extra_imgs[2].src = "images/bonus/ship_speed.png";
    extra_imgs[3].src = "images/bonus/super_bullet.png";
    extra_imgs[4].src = "images/bonus/invis.png";
    extra_imgs[5].src = "images/bonus/invis_bullet.png";
    extra_imgs[6].src = "images/bonus/life.png";
    extra_imgs[7].src = "images/bonus/shield.png";
    extra_imgs[8].src = "images/bonus/super_bullet2.png";



    collect_bg_frames();

    press_here();
    io_init();
}

function create_audio() {
    menu_music = new Audio("sounds/music/menu.mp3");
    menu_music.volume = 0.5;
    pew_sound = new Audio("sounds/pew.wav");
    pew_sound.volume = 0.5;
    boom_sound = new Audio("sounds/boom.wav");
    boom_sound.volume = 0.5;
    new_fleet_sound = new Audio("sounds/new_fleet.wav");
    new_fleet_sound.volume = 0.5;
    get_extra_sound = new Audio("sounds/get_extra.wav");
    get_extra_sound.volume = 0.5;

    music = [
        new Audio("sounds/music/1.mp3"),
        new Audio("sounds/music/2.wav"),
        new Audio("sounds/music/3.mp3"),
        new Audio("sounds/music/4.wav"),
        new Audio("sounds/music/5.mp3"),
        new Audio("sounds/music/6.mp3")
    ];

    radio = new Audio();
    radio.volume = 0.5;

    tracks = [];
    for (var i = 0; i < music.length; i = i) {
        track_num = Math.floor(Math.random() * Math.floor(6));
        if (!tracks.includes(track_num)) {
            tracks.push(track_num);
            i++;
        }
    }
    radio.onended = play_radio;
}

function play_menu_music() {
    if (inMenu) {
        menu_music.play();
        menu_music.loop = true;
    }
}

function play_radio() {
    if (tracks.length > 0) {
        if (inMenu == true) {
            return;
        }

        var track = tracks[0];
        tracks.splice(0, 1);
        radio = music[track];

        radio.play();
        radio.onended = play_radio
    }
}

function draw() {
    ctx.clearRect(0, 0, canv.width, canv.height);

    if (inMenu) {
        menu_draw();
        draw_sound_icon();
    }
    else {
        ingame_draw();
    }

    cursor_changer();

    requestAnimationFrame(draw);
}

function check_mouse() {
    canv.addEventListener("mousemove", function cm(e) {
        var x = e.offsetX;
        var y = e.offsetY;

        if (inMenu) {
            // Play button
            if (x >= play_button_x && y >= play_button_y &&
                x <= play_button_x2 && y <= play_button_y2 &&
                !inSearch) {
                mouse_on = "play_button";
            }
            // ai|human select
            else if (x >= enemy_select_x && y >= enemy_select_y &&
                x <= enemy_select_x2 - 100 && y <= enemy_select_y2 &&
                !inSearch) {
                mouse_on = "ai_select_button";
            }
            else if (x >= enemy_select_x + 100 && y >= enemy_select_y &&
                x <= enemy_select_x2 && y <= enemy_select_y2 &&
                !inSearch) {
                mouse_on = "human_select_button";
            }
            // Search cancel button
            else if (x >= 470 && x <= 630 &&
                y >= 380 && y <= 430 && inSearch) {
                mouse_on = "cancel_button";
            }
            // lang select
            else if (x >= ru_flag_x && x <= ru_flag_x2 &&
                y >= ru_flag_y && y <= ru_flag_y2) {
                mouse_on = "ru_flag";
            }
            else if (x >= en_flag_x && x <= en_flag_x2 &&
                y >= en_flag_y && y <= en_flag_y2) {
                mouse_on = "en_flag";
            }
            // sound icon
            else if (x >= sound_icon_x && x <= sound_icon_x2 &&
                y >= sound_icon_y && y <= sound_icon_y2) {
                mouse_on = "sound_icon";
            }
            else {
                mouse_on = "";
            }
        }
        // ingame
        else {
            if (x >= ready_button_x && x <= ready_button_x2 &&
                y >= ready_button_y && y <= ready_button_y2 &&
                !started) {
                mouse_on = "ready_button";
            }
            else {
                mouse_on = "";
            }
        }
    });

    // Mouse click
    canv.onclick = click_check;
}

function keyboard_add_events() {
    // Keyboard keys
    window.addEventListener("keydown", function kp(e) {
        key_check(e.code)
    });
    window.addEventListener("keyup", function kp2(e) {
        key_release(e.code);
    });
}

function click_check() {
    switch (mouse_on) {
        case "play_button":
            if (selected_enemy == "human") {
                mouse_on = "";
                search_room();
            }
            else {
                mouse_on = "";
                inMenu = false;
                round_init();
                menu_music.load();
                play_radio();
            }
            break;
        case "ai_select_button":
            selected_enemy = "ai";
            break;
        case "human_select_button":
            selected_enemy = "human";
            break;
        case "ru_flag":
            lang = "ru";
            break;
        case "en_flag":
            lang = "en";
            break;
        case "sound_icon":
            sounds = !sounds;
            break;
        case "ready_button":
            ready_pressed = true;
            if (selected_enemy == 'human') {
                socket.emit('ready');
            }
            break;
        case "cancel_button":
            unsearch_room();
            break;
    }
}

function key_check(key) {
    switch (key) {
        case "KeyM":
            sounds = !sounds;
            break;
        case "ArrowLeft":
            ship1.go_left = true;
            break;
        case "KeyA":
            ship1.go_left = true;
            break;
        case "ArrowRight":
            ship1.go_right = true;
            break;
        case "KeyD":
            ship1.go_right = true;
            break;
        case "Space":
            shoot("ship1_img", ship1.x + (ship1_img.width / 2) - 3, ship1.y);
            break;
        case "Enter":
            shoot("ship1_img", ship1.x + (ship1_img.width / 2) - 3, ship1.y);
            break;
    }
    if (selected_enemy == 'human') {
        mp_send_direction(ship1.go_left, ship1.go_right);
    }
}

function key_release(key) {
    if (key == "ArrowLeft" || key == "KeyA") {
        ship1.go_left = false;
    }
    else if (key == "ArrowRight" || key == "KeyD") {
        ship1.go_right = false;
    }
    if (selected_enemy == 'human') {
        mp_send_direction(ship1.go_left, ship1.go_right);
    }
}

function cursor_changer() {
    if (mouse_on != "") {
        canv.classList.add("active_cursor");
    }
    else {
        canv.classList.remove("active_cursor");
    }

    try {
        if (started == true) {
            canv.classList.add("no_cursor");
        }
        else {
            canv.classList.remove("no_cursor");
        }
    }
    catch (ReferenceError) {
        canv.classList.remove("no_cursor");
        return;
    }
}

function uncheck_mouse() {
    //canv.removeEventListener(cm);
}

function menu_draw() {
    draw_bg();
    draw_logo();
    draw_play_button();
    draw_enemy_select_button();
    draw_lang_select();
    draw_players_info();

    if (inSearch) {
        draw_search();
    }

    sounds_update();
}

function draw_bg() {
    if (bg_frame_num == null) {
        bg_frame_num = 0;
    }
    else if (bg_frame_num > bg_frames.length - 1) {
        bg_frame_num = 0
    }

    ctx.drawImage(bg_frames[bg_frame_num], 0, 0);

    bg_frame_num++;
}

function collect_bg_frames() {
    // Собрать кадры фона в массив (путь к ним)
    for (let i = 1; i <= 270; i++) {
        var frame = new Image();
        frame.src = "images/bg_frames/frame" + i + ".gif";
        bg_frames.push(frame);
    }
}

function draw_logo() {
    ctx.drawImage(logo_img, 270, 80);
}

function draw_play_button() {
    // Форма
    play_button_x = 450;
    play_button_y = 320;

    if (mouse_on == "play_button") {
        ctx.drawImage(play_button_a, play_button_x, play_button_y);
    }
    else {
        ctx.drawImage(play_button, play_button_x, play_button_y);
    }

    play_button_x2 = get_x2(play_button_x, play_button);
    play_button_y2 = get_y2(play_button_y, play_button);

    // Текст
    ctx.fillStyle = "#ffffff";
    if (lang == "en") {
        ctx.font = "bold 38pt sans-serif";
        ctx.fillText("PLAY", play_button_x + 35, play_button_y + 50);
    }
    else if (lang == "ru") {
        ctx.font = "bold 34pt sans-serif";
        ctx.fillText("ИГРАТЬ", play_button_x + 13, play_button_y + 45);
    }
}

function draw_enemy_select_button() {
    enemy_select_x = 450;
    enemy_select_y = play_button_y2;

    if (selected_enemy == "ai") {
        ctx.drawImage(ai_select, enemy_select_x, enemy_select_y);
    }
    else {
        ctx.drawImage(human_select, enemy_select_x, enemy_select_y);
    }

    enemy_select_x2 = get_x2(enemy_select_x, ai_select);
    enemy_select_y2 = get_y2(enemy_select_y, ai_select);

    draw_enemy_select_button_text();
}
function draw_enemy_select_button_text() {
    ctx.font = "bold 18pt sans-serif";

    var ai_x = enemy_select_x + 40;
    var ai_y = enemy_select_y + 23;
    var h_x = ai_x + 65;
    var h_y = ai_y;

    if (lang == "en") {
        ctx.fillText("AI", ai_x, ai_y);
        ctx.fillText("HUMAN", h_x, h_y);
    }
    else if (lang == "ru") {
        ctx.fillText("ИИ", ai_x - 5, ai_y);
        ctx.fillText("ЧЕЛ.", h_x + 20, h_y);
    }
}

function draw_players_info() {
    ctx.font = "normal 20pt sans-serif";
    var str = "";
    if (lang == 'en') {
        str += "Players online: ";
    }
    else {
        str += "Игроков в сети: ";
    }
    str += players_online;
    ctx.fillText(str, 780, 670);
}

function get_x2(x, img) {
    var x2 = x + img.width;
    return x2;
}
function get_y2(y, img) {
    var y2 = y + img.height;
    return y2;
}

function draw_lang_select() {


    ru_flag_x = 950;
    ru_flag_y = 200;
    ru_flag_x2 = get_x2(ru_flag_x, ru_flag);
    ru_flag_y2 = get_y2(ru_flag_y, ru_flag);

    en_flag_x = 950;
    en_flag_y = ru_flag_y2 + 20;
    en_flag_x2 = get_x2(en_flag_x, en_flag);
    en_flag_y2 = get_y2(en_flag_y, en_flag);

    if (lang == "ru") {
        ctx.drawImage(ru_flag, ru_flag_x, ru_flag_y);
        ctx.globalAlpha = 0.125;
        ctx.drawImage(en_flag, en_flag_x, en_flag_y);
    }
    else if (lang == "en") {
        ctx.drawImage(en_flag, en_flag_x, en_flag_y);
        ctx.globalAlpha = 0.125;
        ctx.drawImage(ru_flag, ru_flag_x, ru_flag_y);
    }
    ctx.globalAlpha = 1;
}

function draw_sound_icon() {
    // Icon
    sound_icon_x = 960;
    sound_icon_y = 400;
    ctx.drawImage(sound_icon, sound_icon_x, sound_icon_y, 50, 50);

    sound_icon_x2 = get_x2(sound_icon_x, sound_icon);
    sound_icon_y2 = get_y2(sound_icon_y, sound_icon);

    if (!sounds) {
        ctx.drawImage(mute_icon, sound_icon_x - 5, sound_icon_y - 5, 60, 60);
    }

    // Text
    ctx.font = "normal 30pt sans-serif";
    ctx.fillText("M", sound_icon_x - 45, sound_icon_y2 - 8);
}

function round_vars_init() {
    // Direction: 0 = idle, -1 = left, 1 = right.
    ship1 = {
        lifes: 3,
        x: canv.width / 2,
        y: canv.height - (30 + ship1_img.height),
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
        shield: false
    }

    ship2 = {
        lifes: 3,
        x: canv.width / 2,
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
        shield: false
    }

    bullets = [];
    extras = [];
    extras_length = 15000; // in ms
    started = false;
    ayy_spawn_interval = 15000; // in Milliseconds
    ayy_timer = 0;
    ayy_fleet = [];
    ayy_speed = 1;
}

function round_init() {
    ready_timer_ms = 2999;

    ingame_bg_select();
    round_vars_init();
    if (selected_enemy == "ai") {
        round_update();
        setTimeout(ayy_timer_increase, ayy_spawn_interval / 360);
    }
    uncheck_mouse();
    change_engines();
    setInterval(sounds_update, 250);

    ready_pressed = false;
}

function update_ships_coords2() {
    ship1_x2 = get_x2(ship1.x, ship1_img);
    ship1_y2 = get_y2(ship1.y, ship1_img);
    ship2_x2 = get_x2(ship2.x, ship2_img);
    ship2_y2 = get_y2(ship2.y, ship2_img);
}

function round_update() {
    if (selected_enemy == 'human') {
        return;
    }

    check_direction();
    bullets_update();
    update_ships_coords2();
    update_fleet();
    update_loot();
    extras_end_check();

    if ((ship1.x + (ship1.direction * ship1.speed) >= 0) && (ship1_x2 + (ship1.direction * ship1.speed) <= canv.width)) {
        ship1.x += (ship1.direction * ship1.speed);
    }
    if ((ship2.x + (ship2.direction * ship2.speed) >= 0) && (ship2_x2 + (ship2.direction * ship2.speed) <= canv.width)) {
        ship2.x += (ship2.direction * ship2.speed);
    }

    if (ship1.alive == false || ship2.alive == false) {
        setTimeout(function () {
            round_restart();
        }, 1000);
    }

    if (started == true && ai_enabled == true) {
        ai_update();
    }

    if (inMenu == false) {
        setTimeout(round_update, 1000 / 60);
    }
    return;
}

function bullets_update() {
    bullets.forEach(function (item, i, arr) {
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
                if (ship1.shield == true && item.super_bullet == false) {
                    ship1.shield = false;
                }
                else {
                    ship_die("ship1_img");
                }
                if (item.super_bullet == false) {
                    bullets.splice(i, 1);
                }
                boom_sound.play();
            }
        }
        else if (item.x_pos >= ship2.x && item.x_pos + 6 <= ship2_x2 &&
            item.y_pos >= ship2.y && item.y_pos + 25 <= ship2_y2) {
            if (item.owner == "ship1_img" && ship2.alive) {
                if (ship2.shield == true && item.super_bullet == false) {
                    ship2.shield = false;
                }
                else {
                    ship_die("ship2_img");
                }
                if (item.super_bullet == false) {
                    bullets.splice(i, 1);
                }
                boom_sound.play();
            }
        }
        else if (item.y_pos < 0 || item.y_pos + 25 > canv.height) {
            bullets.splice(i, 1);
        }

        // Aliens fleet collide check
        ayy_fleet.forEach(function (item2, i2, arr2) {
            if (item.x_pos + 6 >= item2.x_pos && item.x_pos <= item2.x_pos + ayy_img.width &&
                item.y_pos <= item2.y_pos + ayy_img.height && item.y_pos + 25 >= item2.y_pos) {
                if (item.super_bullet == false) {
                    bullets.splice(i, 1);
                }
                ayy_fleet.splice(i2, 1);
                drop_loot(item.owner, item2.x_pos, item2.y_pos);
                boom_sound.play();
            }
        })
    });
}

function ingame_draw() {
    draw_ingame_bg();
    if (started == false) {
        if (ready_pressed == false) {
            draw_ready_button();
        }
        else if (selected_enemy == 'ai' || (selected_enemy == 'human' && mp_ready == true)) {
            ready_timer_ms = ready_button_timer(ready_timer_ms);
            if (ready_timer_ms < 13) {
                ready_button_pressed();
                ready_timer_ms = 2999;
            }
        }
    }

    if (isSecondPlayer) {
        ctx.translate(1024, 768);
        ctx.scale(-1, -1);
        ctx.translate(0, 0);
    }

    draw_loot();
    draw_bullets();
    draw_fleet();
    draw_ships();

    if (isSecondPlayer) {
        ctx.translate(1024, 768);
        ctx.scale(-1, -1);
        ctx.translate(0, 0);
    }

    draw_sound_icon();
    draw_ayy_timer();
    draw_extras_timer();
    draw_lifes();
}

function draw_ingame_bg() {
    // num: 1 - for space, and 2 - for structures.
    ctx.drawImage(ingame_bg[0], start_point_x, start_point_y);

    ctx.drawImage(ingame_bg[0], start_point_x + ingame_bg[0].width, start_point_y); // Y-center bg
    //ctx.drawImage(ingame_bg[0], start_point_x + ingame_bg[0].width, start_point_y + ingame_bg[0].height); // Below it
    ctx.drawImage(ingame_bg[0], start_point_x + ingame_bg[0].width, start_point_y - ingame_bg[0].height); // Over it
    ctx.drawImage(ingame_bg[0], start_point_x, start_point_y - ingame_bg[0].height);

    if (start_point_y == ingame_bg[0].height) {
        start_point_y = 0;
    }

    start_point_y ++;
}

function draw_ships() {
    if (ship1.alive) {
        if (isSecondPlayer == true && ship1.extras[4] > 0) {
            ctx.drawImage(ship2_invis, ship1.x, ship1.y);
        }
        else {
            ctx.drawImage(ship1_img, ship1.x, ship1.y);
        }

        if (ship1.extras[4] == 0) {
            ctx.drawImage(ship1_engines[ship1.engines_frame - 1], ship1.x + 25.5, ship1.y + ship1_img.height - 2);
        }

        //shield
        if (ship1.shield) {
            ctx.globalAlpha = 0.625;
            ctx.drawImage(ship_shield, ship1.x - 10, ship1.y - 5);
            ctx.globalAlpha = 1;
        }
    }
    if (ship2.alive) {
        if (ship2.extras[4] > 0 && isSecondPlayer == false) {
            ctx.drawImage(ship2_invis, ship2.x, ship2.y);
        }
        else {
            ctx.drawImage(ship2_img, ship2.x, ship2.y);
        }

        if (ship2.extras[4] == 0) {
            ctx.drawImage(ship2_engines[ship2.engines_frame - 1], ship2.x + 10, ship2.y + 24);
        }

        //shield
        if (ship2.shield) {
            ctx.save();
            ctx.translate(ship2.x + (ship2_img.width / 2), ship2.y + (ship2_img.height / 2));
            ctx.rotate(Math.PI);
            
            ctx.globalAlpha = 0.625;
            ctx.drawImage(ship_shield, -(ship2_img.width  / 2) - 10, -(ship2_img.height / 2) - 5);
            ctx.globalAlpha = 1;

            ctx.restore();
        }
    }
}

function change_engines() {
    if (ship1.engines_frame == 1) {
        ship1.engines_frame++;
    }
    else {
        ship1.engines_frame--;
    }

    if (ship2.engines_frame == 1) {
        ship2.engines_frame++;
    }
    else {
        ship2.engines_frame--;
    }

    ayy_fleet.forEach(function (item, i, arr) {
        if (item.engines_frame == 1) {
            item.engines_frame++;
        }
        else {
            item.engines_frame--;
        }
    })

    if (ship1.lifes == 0 || ship2.lifes == 0) {
        return;
    }
    else {
        setTimeout(change_engines, 200);
    }
}

function draw_ready_button() {
    ready_button_x = 450;
    ready_button_y = 350;

    if (mouse_on == "ready_button") {
        ctx.drawImage(play_button_a, ready_button_x, ready_button_y);
    }
    else {
        ctx.drawImage(play_button, ready_button_x, ready_button_y);
    }
    ready_button_x2 = get_x2(ready_button_x, play_button);
    ready_button_y2 = get_y2(ready_button_y, play_button);

    if (lang == "en") {
        ctx.fillText("READY", ready_button_x + 30, ready_button_y2 - 15);
    }
    else if (lang == "ru") {
        ctx.fillText("ГОТОВ", ready_button_x + 35, ready_button_y2 - 15);
    }
}

function ingame_bg_select() {
    ingame_bg_num = getRandomInt(ingame_bg.length);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function check_direction() {
    if (started == false) {
        return;
    }

    if (ship1.go_right && ship1.go_left) {
        ship1.direction = 1;
    }
    else if (ship1.go_right) {
        ship1.direction = 1;
    }
    else if (ship1.go_left) {
        ship1.direction = -1;
    }
    else {
        ship1.direction = 0;
    }
}

function shoot(ship, x, y) {
    // For bonus images testing
    //drop_extra("ship1_img", "2x_bullets_speed", 1, "green", 400, 0);
    //drop_extra("ship1_img", "2x_ship_speed", 2, "green", 400, 0);
    //drop_extra("ship1_img", "extra_life", 6, "purple", 400, 0);
    //drop_extra("ship1_img", "shield", 7, "purple", 400, 0);
    //drop_extra("ship1_img", "invision", 4, "gold", 400, 0);

    var cs = can_shoot(ship);
    var bullet_speed = 10;

    if (ship == "ship1_img") {
        bullet_speed = ship1.bullet_speed;
    }
    else {
        bullet_speed = ship2.bullet_speed;
    }

    if (selected_enemy == 'human') {
        socket.emit('send shoot');
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
        pew_sound.play();
    }

    bullets.sort((prev, next) => {
        if (prev.x_pos < next.x_pos) return -1;
        if (prev.x_pos > next.x_pos) return 1;
    });
}

function can_shoot(ship) {
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

    if (started == false) {
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

function draw_bullets() {
    bullets.forEach(function (item, i, arr) {
        if (item.stealth_bullet) {
            ctx.globalAlpha = 0.15;
        }

        if (item.owner == "ship1_img") {
            if (item.super_bullet) {
                ctx.drawImage(extra_imgs[3], item.x_pos, item.y_pos);
            }
            else {
                ctx.drawImage(bullet_img, item.x_pos, item.y_pos);
            }
        }
        else {
            if (item.super_bullet) {
                ctx.drawImage(extra_imgs[8], item.x_pos, item.y_pos);
            }
            else {
                ctx.drawImage(bullet_img2, item.x_pos, item.y_pos);
            }
        }

        ctx.globalAlpha = 1;
    });
}

function round_restart() {
    var lifes = [ship1.lifes, ship2.lifes];
    round_vars_init();
    ship1.lifes = lifes[0];
    ship2.lifes = lifes[1];
}

function ayy_timer_increase() {
    if (selected_enemy == 'human') {
        return;
    }
    if (started) {
        ayy_timer += ayy_spawn_interval / 360;
        if (ayy_timer >= ayy_spawn_interval) {
            add_fleet();
            ayy_timer = 0;
        }
    }
    if (ship1.lifes > 0 && ship2.lifes > 0) {
        setTimeout(ayy_timer_increase, ayy_spawn_interval / 360);
    }
}

function draw_ayy_timer() {
    ctx.drawImage(ayy_img, canv.width - 70, 142.5, 41, 45);

    ctx.beginPath();
    ctx.strokeStyle = "#7d7d7d"
    ctx.lineWidth = 7;
    ctx.arc(canv.width - 110, 165, 20, 0, 360);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(canv.width - 110, 165);
    ctx.arc(canv.width - 110, 165, 20, 1.5 * Math.PI, (ayy_timer / (ayy_spawn_interval / 360) * 0.01745 + 1.5 * Math.PI), false);
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.closePath();

    ctx.globalAlpha = 1;
}

function add_fleet() {
    for (var i = 0; i < 10; i++) {
        var ayy_space = (canv.width - (ayy_img.width * 10)) / 10;
        var alien = {
            owner: "ship1_img",
            x_pos: (ayy_img.width * i) + (ayy_space * i),
            y_pos: (canv.height / 2) + (ayy_img.height / 2),
            engines_frame: 1,
            dir: 1
        };
        if (i == 0) {
            alien.x_pos += ayy_space / 2;
        }
        if (i % 2 == 1) {
            alien.owner = "ship2_img";
            alien.y_pos -= ayy_img.height * 2;
            alien.dir = -1;
        }

        ayy_fleet.push(alien);
    }
    ayy_speed += 0.5;
    new_fleet_sound.play();
}

function draw_fleet() {
    ayy_fleet.forEach(function (item, i, arr) {
        ctx.drawImage(ayy_img, item.x_pos, item.y_pos);
        ctx.drawImage(ayy_engines[item.engines_frame - 1], item.x_pos - 4, item.y_pos - 5);
    });
}

function update_fleet() {
    ayy_fleet.forEach(function (item, i, arr) {
        if (item.x_pos < 10 || canv.width - (item.x_pos + ayy_img.width) < 10) {
            if (item.owner == "ship1_img") {
                item.y_pos += ayy_img.height + 5 + 20;
            }
            else {
                item.y_pos -= ayy_img.height + 5 + 20;
            }
            item.dir = -item.dir;

            if (item.y_pos < ship2_y2 && ship2.alive) {
                ship_die("ship2_img");
            }
            else if (item.y_pos > ship1.y && ship1.alive) {
                ship_die("ship1_img");
            }
        }

        item.x_pos += ayy_speed * item.dir;
    })
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
            get_extra_sound.play();
            give_extra(item.name, item.owner);
        }
        // bonus leave map
        if (item.y_pos > canv.height || item.y_pos < 0) {
            extras.splice(i, 1);
        }
    })

}

function draw_loot() {
    extras.forEach(function (item, i, arr) {
        var img_x = item.x_pos - 5;
        ctx.strokeStyle = item.circle_color;
        ctx.lineWidth = 7;
        /* CIRCLE DRAW 
        ctx.beginPath();
        ctx.arc(item.x_pos, item.y_pos, 20, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath(); */

        if (item.name == "2x_ship_speed") {
            ctx.drawImage(extra_imgs[item.image], img_x, item.y_pos - 14, 50, 50);
        }
        else if (item.name == "extra_life") {
            ctx.drawImage(extra_imgs[item.image], img_x, item.y_pos - 14, 50, 50);
        }
        else if (item.name == "shield") {
            ctx.drawImage(extra_imgs[item.image], img_x, item.y_pos - 14, 50, 50);
        }
        else if (item.name == "invision") {
            ctx.drawImage(extra_imgs[item.image], img_x, item.y_pos - 20, 50, 60)
        }
        else {
            ctx.drawImage(extra_imgs[item.image], img_x, item.y_pos - 14);
        }
    })
}

function give_extra(name, owner) {
    if (owner == "ship1_img") {
        switch (name) {
            case "3x_bullets":
                ship1.bullets_limit = 3;
                ship1.extras[0] = extras_length;
                break;
            case "2x_bullets_speed":
                ship1.bullet_speed = 20;
                ship1.extras[1] = extras_length;
                break;
            case "2x_ship_speed":
                ship1.speed = 15;
                ship1.extras[2] = extras_length;
                break;
            case "extra_life":
                if (ship1.lifes < 3) {
                    ship1.lifes++;
                }
                break;
            case "shield":
                ship1.shield = true;
                break;
            case "super_bullets":
                ship1.extras[3] = extras_length;
                break;
            case "invision":
                ship1.extras[4] = extras_length;
                break;
            case "stealth_bullets":
                ship1.extras[5] = extras_length;
                break;
        }
    }
    else {
        switch (name) {
            case "3x_bullets":
                ship2.bullets_limit = 3;
                ship2.extras[0] = extras_length;
                break;
            case "2x_bullets_speed":
                ship2.bullet_speed = 20;
                ship2.extras[1] = extras_length;
                break;
            case "2x_ship_speed":
                ship2.speed = 15;
                ship2.extras[2] = extras_length;
                break;
            case "extra_life":
                if (ship2.lifes < 3) {
                    ship2.lifes++;
                }
                break;
            case "shield":
                ship2.shield = true;
                break;
            case "super_bullets":
                ship2.extras[3] = extras_length;
                break;
            case "invision":
                ship2.extras[4] = extras_length;
                break;
            case "stealth_bullets":
                ship2.extras[5] = extras_length;
                break;
        }
    }
}

function extras_timer() {
    for (var i = 0; i < ship1.extras.length; i++) {
        if (ship1.extras[i] > 0) {
            ship1.extras[i] -= 50;
        }
        if (ship2.extras[i] > 0) {
            ship2.extras[i] -= 50;
        }
    }
    if (started) {
        setTimeout(extras_timer, 50);
    }
}

function draw_extras_timer() {
    var extra_y = 200;
    if (isSecondPlayer == true) {
        for (var i = 0; i < ship2.extras.length; i++) {
            if (ship2.extras[i] > 0) {
                var extra_line_width = 20;
                var img_x = 67;
                var x_size = extra_imgs[i].width;
                var y_size = extra_imgs[i].height;

                if (i == 2) {
                    img_x -= 10;
                    extra_line_width += 5;
                }
                else if (i == 4) {
                    img_x -= 8;
                    x_size = 25;
                    y_size = 25;
                }

                ctx.strokeStyle = "white";
                ctx.lineWidth = 10;
                ctx.beginPath();
                ctx.arc(70, extra_y, extra_line_width, 1.5 * Math.PI, (ship2.extras[i] / (extras_length / 360) * 0.01745 + 1.5 * Math.PI));
                ctx.stroke();
                ctx.closePath();
                ctx.drawImage(extra_imgs[i], img_x, extra_y - 14, x_size, y_size);

                extra_y += 75;
            }
        }
    }
    else {
        for (var i = 0; i < ship1.extras.length; i++) {
            if (ship1.extras[i] > 0) {
                var extra_line_width = 20;
                var img_x = 67;
                var x_size = extra_imgs[i].width;
                var y_size = extra_imgs[i].height;

                if (i == 2) {
                    img_x -= 10;
                    extra_line_width += 5;
                }
                else if (i == 4) {
                    img_x -= 8;
                    x_size = 25;
                    y_size = 25;
                }

                ctx.strokeStyle = "white";
                ctx.lineWidth = 10;
                ctx.beginPath();
                ctx.arc(70, extra_y, extra_line_width, 1.5 * Math.PI, (ship1.extras[i] / (extras_length / 360) * 0.01745 + 1.5 * Math.PI));
                ctx.stroke();
                ctx.closePath();
                ctx.drawImage(extra_imgs[i], img_x, extra_y - 14, x_size, y_size);

                extra_y += 75;
            }
        }
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

function draw_lifes() {
    var img_x = canv.width - life_img.width - 30;
    var img_y = sound_icon_y + 100;

    var ship_lifes;
    var ship2_lifes;

    if (isSecondPlayer == true) {
        ship_lifes = ship2.lifes;
        ship2_lifes = ship1.lifes;
    }
    else {
        ship_lifes = ship1.lifes;
        ship2_lifes = ship2.lifes;
    }

    for (var i = 0; i < ship_lifes; i++) {
        ctx.save();
        ctx.translate(img_x + (life_img.width / 2), img_y + (life_img.height / 2) + (life_img.height * i));
        ctx.rotate(Math.PI / 180 * -55);
        ctx.drawImage(life_img, 0, 0);
        ctx.restore();
    }
    for (var i = 0; i < ship2_lifes; i++) {
        ctx.save();
        ctx.translate(30 + (life_img.width / 2), 100 + (life_img.height / 2) + (life_img.height * i));
        ctx.rotate(Math.PI / 180 * 55);
        ctx.drawImage(life_img, 0, 0);
        ctx.restore();
    }
}

function check_win() {
    if (ship1.lifes == 0 || ship2.lifes == 0) {
        radio.load();
        init();
    }

    if (ship1.lifes == 0) {
        alert('YOU LOSE!');
    }
    else if (ship2.lifes == 0) {
        alert('YOU WIN!');
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
    boom_sound.play();
    check_win();
}

function sounds_update() {
    if (sounds) {
        var turn_to = false;
    }
    else {
        var turn_to = true;
    }

    menu_music.muted = turn_to;
    pew_sound.muted = turn_to;
    boom_sound.muted = turn_to;
    new_fleet_sound.muted = turn_to;
    get_extra_sound.muted = turn_to;
    radio.muted = turn_to;
}

function ready_button_pressed() {
    started = true;
    if (selected_enemy == 'ai') {
        ai_enable();
        extras_timer();
    }
    else {
        socket.emit('ready timer end');
    }
    mouse_on = '';
}

function ready_button_timer(ms) {
    ctx.font = "bold 100pt Sans-serif";
    ctx.fillText(Math.floor(ms / 1000) + 1, 500, 420);
    ms -= 13;

    return ms;
}

function search_room() {
    inSearch = true;
    socket.emit("go_search");
}

function unsearch_room() {
    inSearch = false;
    socket.emit("stop_search");
}

function draw_search() {
    ctx.fillStyle = "gray";
    ctx.fillRect(450, 300, 200, 150);
    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(455, 305, 190, 140);

    ctx.fillStyle = "white";

    var search_text = "";
    var cancel_text = "";
    if (lang == "ru") {
        search_text = "Идёт поиск...";
        cancel_text = "Отмена"
    }
    else {
        search_text = "Searching...";
        cancel_text = "Cancel"
    }

    ctx.fillText(search_text, 470, 340);

    ctx.fillStyle = "gray";
    ctx.fillRect(470, 380, 160, 50);
    ctx.fillStyle = "blue";
    if (mouse_on == "cancel_button") {
        ctx.fillStyle = "#00A2E8";
    }
    ctx.fillRect(475, 385, 150, 40);
    ctx.fillStyle = "white";
    ctx.font = "bold 25pt sans-serif";

    var str_x = 485;
    if (lang == 'en') {
        str_x += 10;
    }

    ctx.fillText(cancel_text, str_x, 415);
}



function init_singleplayer() {
}



function ai_core() {
    if (ai_enabled == true) {
        ai_update();
    }
}

function ai_enable() {
    if (selected_enemy == "ai") {
        ai_enabled = true;
        ai_params_init();
    }
}

function ai_params_init() {
    ai_enabled = true;
    ai_danger_level = 0;
    ai_evade_result = true;
    ai_shoot_cooldown = 0;
}

function ai_update() {
    // Collect lines with bullets
    ai_danger_lines = [];
    bullets.forEach(function (item, i, arr) {
        if (item.owner == "ship1_img") {
            ai_danger_lines.push(item.x_pos);
        }
    });

    ai_danger_level = 0;
    ai_state = '';
    ship2.direction = 0;

    if ((ship2.x >= ship1.x && ship2.x <= ship1_x2) ||
        (ship2_x2 >= ship1.x && ship2_x2 <= ship1_x2) &&
        ship1.extras[4] == 0) {
        ai_danger_level = 2;
    };

    ai_danger_lines.forEach(function (item, i, arr) {
        if (item >= ship2.x - 12 && item + 18 <= ship2_x2) {
            ai_danger_level = 3;
        }
    });

    // Don't stay in corner
    /* if (ship2_x2 >= canv.width - (ship2_img.width * 2) ||
        ship2.x <= ship2_img.width * 2) {
            ai_evade();
    } */

    ai_act_select();
}

function ai_act_select(bullet_x) {
    if (ai_danger_level == 3 || ai_evade_result == false) {
        ai_evade_result = ai_evade();
    }
    else if (ai_danger_level == 2) {
        if (ayy_fleet.length == 0) {
            ai_attack();
        }
        else {
            ai_shoot();
            ai_grind();
        }
    }
    else {
        ai_grind();
    }
}

function ai_evade() {
    //shit

    ai_state = 'evade';

    var ai_lines_cost = [];

    for (var i = 0; i < ai_danger_lines.length; i++) {
        if (i == 0) {
            var piece_size = ai_danger_lines[i];
        }
        else {
            var piece_size = ai_danger_lines[i] - ai_danger_lines[i - 1];
        }
        ai_lines_cost.push(piece_size);
    }
    ai_lines_cost.push(canv.width - ai_danger_lines[ai_danger_lines.length - 1]);

    //Get coord of biggest piece center
    evade_center = ai_evade_get_center(ai_lines_cost);

    var ship2_center = ship2.x + (ship2_img.width / 2);
    if (Math.abs(evade_center - ship2_center) < ship2.speed) {
        ship2.direction = 0;
        ai_shoot();
    }
    else if (ship2_center < evade_center) {
        ship2.direction = 1;
        ai_shoot();
    }
    else if (ship2_center > evade_center) {
        ship2.direction = -1;
        ai_shoot();
    }

    var bullets_clear = true;
    bullets.forEach(function (item, i, arr) {
        if (item.owner == "ship1_img") {
            bullets_clear = false;
        }
    })

    if (bullets_clear == false) {
        return false;
    }
}

function ai_evade_get_center(costs) {
    var costs_sorted = costs.slice();
    costs_sorted.sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
    });
    var biggest_size = costs_sorted[costs_sorted.length - 1];
    var biggest_index = costs.indexOf(biggest_size);
    var m = 0; // Distance in px to biggest piece
    for (var j = 0; j < biggest_index; j++) {
        m += costs[j];
    }

    var evade_center = m + (biggest_size / 2);

    return evade_center;
}

function ai_attack() {
    if (ship1.extras[4] > 0) {
        ai_evade();
        return;
    }

    ship2_center = ship2.x + ((ship2_x2 - ship2.x) / 2);
    ship1_center = ship1.x + ((ship1_x2 - ship1.x) / 2);
    ai_preemption = ((ship1_y2 - ship2.y) / ship2.bullet_speed) * (ship1.speed * ship1.direction); // X distance to shoot
    shoot_pos = ship1_center + ai_preemption;

    if (ship2.x <= ship2.speed || ship2_x2 >= canv.width - ship2.speed) {
        ai_shoot();
    }
    if (Math.abs(ship2_center - shoot_pos) < ship2.speed) {
        ai_shoot();
    }
    else if (ship2_center > shoot_pos) {
        ship2.direction = -1;
        ai_shoot();
    }
    else if (ship2_center < shoot_pos) {
        ship2.direction = 1;
        ai_shoot();
    }
}

function ai_grind() {
    if (extras.some(ai_is_any_ship2_loot)) {
        ai_pick_loot();
        return;
    }

    if (ayy_fleet.length == 0) {
        ai_attack();
        return;
    }

    var ai_ayy_target = 0;

    for (var i = ayy_fleet.length - 1; i >= 0; i--) {
        if (ayy_fleet[i].owner == "ship2_img") {
            ai_ayy_target = i;
            break;
        }
    }

    var ai_ayy_target_y_center = ayy_fleet[ai_ayy_target].y_pos + (ayy_img.height / 2)
    var ai_ayy_preemption = ((ai_ayy_target_y_center - ship2_y2) / ship2.bullet_speed) * (ayy_speed * ayy_fleet[ai_ayy_target].dir);
    var ai_ayy_shoot_point = (ayy_fleet[ai_ayy_target].x_pos + (ayy_img.width / 2)) + ai_ayy_preemption;

    if (Math.abs((ship2.x + (ship2_img.width / 2)) - ai_ayy_shoot_point) < ship2.speed) {
        ai_shoot();
    }
    else if (ship2.x + (ship2_img.width / 2) > ai_ayy_shoot_point) {
        ship2.direction = -1;
    }
    else {
        ship2.direction = 1;
    }

}

function ai_is_any_ship2_loot(item, i, arr) {
    if (item.owner == "ship2_img") {
        return true;
    }
    else return false;
}

function ai_pick_loot() {
    var target_loot_x = extras.findIndex(ai_is_any_ship2_loot); // x center
    target_loot_x = extras[target_loot_x].x_pos;

    /* extras.forEach(function (item, i, arr) {
        if (item.owner == "ship2_img") {
            target_loot_x = item.x;
            break;
        }
    }); */

    if (Math.abs(ship2.x + (ship2_img.width / 2) - target_loot_x) < 10) {
        ai_shoot();
    }
    else if (ship2.x + (ship2_img.width / 2) < target_loot_x) {
        ship2.direction = 1;
    }
    else {
        ship2.direction = -1;
    }
}

function ai_shoot() {
    if (ai_shoot_cooldown == 0) {
        shoot("ship2_img", ship2.x + (ship2_img.width / 2), ship2_y2);
        ai_shoot_cooldown = 200;
    }
    setTimeout(function () {
        ai_shoot_cooldown = 0;
    }, 200);
    /* if (ship2.bullets_limit == 3) {
        setTimeout(shoot("ship2_img", ship2.x + (ship2_img.width / 2), ship2_y2), 100);
        setTimeout(shoot("ship2_img", ship2.x + (ship2_img.width / 2), ship2_y2), 200);
    } */
}



function init_multiplayer(p1, p2) {
    inMenu = false;
    round_init();

    menu_music.load();
    play_radio();

    mp_ready = false;
}

function mp_game_ready() {
    mp_ready = true;
}

function mp_get_info(data) {
    var go_left = ship1.go_left;
    var go_right = ship1.go_right;
    ship1 = data.ship1;
    ship1.go_left = go_left;
    ship1.go_right = go_right;
    ship2 = data.ship2;

    bullets = data.bullets;
    extras = data.extras;
    started = data.started;
    ayy_timer = data.ayy_timer;
    ayy_fleet = data.ayy_fleet;
    ayy_speed = data.ayy_speed;
}

function mp_send_direction(go_left, go_right) {
    var direction;
    if (go_right == true) {
        direction = 1;
    }
    else if (go_left == true) {
        direction = -1;
    }
    else {
        direction = 0;
    }

    socket.emit('send direction', direction);
}

function mp_play_sound(sound) {
    switch (sound) {
        case 'boom':
            boom_sound.play();
            break;
        case 'pew':
            pew_sound.play();
            break;
        case 'new fleet':
            new_fleet_sound.play();
            break;
        case 'get extra':
            get_extra_sound.play();
            break;
    }
}
