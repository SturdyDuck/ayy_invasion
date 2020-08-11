var canv = document.getElementById("canv");
var ctx = canv.getContext('2d');

press_here_fade_alpha = 1;
press_here();



function press_here() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);
    ctx.fillStyle = "white";
    ctx.font = "normal 30pt sans-serif";
    ctx.fillText("CLICK HERE", 400, 400);

    canv.onclick = press_here_fade;
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
    create_images();
    create_audio();

    play_menu_music();
}

function initDraw() {
    requestAnimationFrame(draw);
}

function global_params_init() {
    inMenu = true;
    bg_frame_num = 0;
    lang = "ru";
    mouse_on = "";
    selected_enemy = "ai";
    sounds = true;
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

    ship1 = new Image();
    ship2 = new Image();
    ship1.src = "images/ship.png";
    ship2.src = "images/ship2.png";

    ship1_protected = new Image();
    ship2_protected = new Image();
    ship1_protected.src = "images/ship_shield.png";
    ship2_protected.src = "images/ship2_shield.png";

    ship2_invis = new Image();
    ship2_invis.src = "images/ship_invis.png";

    life_img = new Image();
    life_img.src = "images/small_ship.png";

    ingame_bg = [
        new Image(),
        new Image(),
        new Image(),
        new Image()
    ];
    ingame_bg_num = 0;

    load_ingame_bg();

    bullet_img = new Image();
    bullet_img2 = new Image();
    bullet_img.src = "images/bullet.png";
    bullet_img2.src = "images/bullet2.png";

    ayy_img = new Image();
    ayy_img.src = "images/alien.png";

    bullets_3x_img = new Image();
    bullets_3x_img.src = "images/bonus/3x_bullet.png";
    bullets_speed_img = new Image();
    bullets_speed_img.src = "images/bonus/bullet_speed.png";
    ship_speed_img = new Image();
    ship_speed_img.src = "images/bonus/ship_speed.png";
    shield_img = new Image();
    shield_img.src = "images/bonus/shield.svg";
    super_bullet_img = new Image();
    super_bullet_img2 = new Image();
    super_bullet_img.src = "images/bonus/super_bullet.png";
    super_bullet_img2.src = "images/bonus/super_bullet2.png";
    invision_png = new Image();
    invision_png.src = "images/bonus/invis.png";
    stealth_bullet_img = new Image();
    stealth_bullet_img.src = "images/bonus/invis_bullet.png";



    collect_bg_frames();
}

function create_audio() {
    menu_music = new Audio("sounds/music/menu.mp3");
    pew_sound = new Audio("sounds/pew.wav");
    boom_sound = new Audio("sounds/boom.wav");
    new_fleet_sound = new Audio("sounds/new_fleet.wav");
    get_extra_sound = new Audio("sounds/get_extra.wav");

    music = [
        new Audio("sounds/music/1.mp3"),
        new Audio("sounds/music/2.wav"),
        new Audio("sounds/music/3.mp3"),
        new Audio("sounds/music/4.wav"),
        new Audio("sounds/music/5.mp3"),
        new Audio("sounds/music/6.mp3")
    ];

    radio = new Audio();

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
        var track = tracks[0];
        tracks.splice(0, 1);
        radio = music[track];

        radio.play();
        radio.onended = play_radio
    }
}

function draw() {
    //ctx.clearRect(0, 0, canv.width, canv.height);

    if (inMenu) {
        menu_draw();
        draw_sound_icon();
    }
    else {
        round_update();
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
                x <= play_button_x2 && y <= play_button_y2) {
                mouse_on = "play_button";
            }
            // ai|human select
            else if (x >= enemy_select_x && y >= enemy_select_y &&
                x <= enemy_select_x2 - 100 && y <= enemy_select_y2) {
                mouse_on = "ai_select_button";
            }
            else if (x >= enemy_select_x + 100 && y >= enemy_select_y &&
                x <= enemy_select_x2 && y <= enemy_select_y2) {
                mouse_on = "human_select_button";
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
                alert("Not ready yet!");
            }
            else {
                mouse_on = "";
                round_initiate();
                menu_music.load();
                play_radio();
                inMenu = false;
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
            break;
    }
}

function key_check(key) {
    switch (key) {
        case "KeyM":
            sounds = !sounds;
            break;
        case "ArrowLeft":
            ship1_go_left = true;
            break;
        case "KeyA":
            ship1_go_left = true;
            break;
        case "ArrowRight":
            ship1_go_right = true;
            break;
        case "KeyD":
            ship1_go_right = true;
            break;
        case "Space":
            shoot("ship1", ship1_x + (ship1.width / 2) - 3, ship1_y);
            break;
        case "Enter":
            shoot("ship1", ship1_x + (ship1.width / 2) - 3, ship1_y);
            break;
    }
}

function key_release(key) {
    if (key == "ArrowLeft" || key == "KeyA") {
        ship1_go_left = false;
    }
    else if (key == "ArrowRight" || key == "KeyD") {
        ship1_go_right = false;
    }
    /*else if (key == "Space" || key == "Enter") {
        ship1_shooting = false;
    }*/
}

function cursor_changer() {
    if (mouse_on != "") {
        canv.classList.add("active_cursor");
    }
    else {
        canv.classList.remove("active_cursor");
    }

    try {
        if (started) {
            canv.classList.add("no_cursor");
        }
        else {
            canv.classList.remove("no_cursor");
        }
    }
    catch (ReferenceError) {
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
    ship1_x = canv.width / 2;
    ship1_y = canv.height - (30 + ship1.height);
    ship1_go_left = false;
    ship1_go_right = false;
    ship1_direction = 0;
    ship1_shooting = false;
    ship1_alive = true;
    ship1_bullets_limit = 1;
    ship1_speed = 10;
    ship1_bullet_speed = 10;
    ship1_extras = [0, 0, 0, 0, 0, 0];
    ship1_shield = false;

    ship2_x = canv.width / 2;
    ship2_y = 30;
    ship2_go_left = false;
    ship2_go_right = false;
    ship2_direction = 0;
    ship2_shooting = false;
    ship2_alive = true;
    ship2_bullets_limit = 1;
    ship2_speed = 10;
    ship2_bullet_speed = 10;
    ship2_extras = [0, 0, 0, 0, 0, 0];
    ship2_shield = false;

    bullets = [];
    extras = [];
    extras_length = 15000; // in ms
    started = false;
    ayy_spawn_interval = 15000; // in Milliseconds
    ayy_timer = 0;
    ayy_fleet = [];
    ayy_speed = 1;
}

function round_initiate() {
    ready_timer_ms = 2999; //Less then 3000, so math.floor + 1 print from 3 to 1, instead of 4 to 1.

    ingame_bg_select();
    round_vars_init();
    setTimeout(ayy_timer_decrease, ayy_spawn_interval / 360);
    uncheck_mouse();

    ship1_lifes = 3;
    ship2_lifes = 3;
    ready_pressed = false;
}

function update_ships_coords2() {
    ship1_x2 = get_x2(ship1_x, ship1);
    ship1_y2 = get_y2(ship1_y, ship1);
    ship2_x2 = get_x2(ship2_x, ship2);
    ship2_y2 = get_y2(ship2_y, ship2);
}

function round_update() {
    check_direction();
    bullets_update();
    update_ships_coords2();
    update_fleet();
    update_loot();
    extras_end_check();
    sounds_update();

    if ((ship1_x + (ship1_direction * ship1_speed) >= 0) && (ship1_x2 + (ship1_direction * ship1_speed) <= canv.width)) {
        ship1_x += (ship1_direction * ship1_speed);
    }
    if ((ship2_x + (ship2_direction * ship2_speed) >= 0) && (ship2_x2 + (ship2_direction * ship2_speed) <= canv.width)) {
        ship2_x += (ship2_direction * ship2_speed);
    }

    if (ship1_alive == false || ship2_alive == false) {
        setTimeout(function restart() {
            round_restart();
        }, 1000);
    }

    if (started == true && ai_enabled == true) {
        ai_update();
    }
}

function bullets_update() {
    bullets.forEach(function (item, i, arr) {
        if (item.owner == "ship1") {
            item.y_pos -= item.speed;
        }
        else {
            item.y_pos += item.speed;
        }

        // Collide check (size of bullet - 6x25)
        if (item.x_pos >= ship1_x && item.x_pos + 6 <= ship1_x2 &&
            item.y_pos >= ship1_y && item.y_pos + 25 <= ship1_y2) {
            if (item.owner == "ship2" && ship1_alive) {
                if (ship1_shield == true) {
                    ship1_shield = false;
                }
                else {
                    ship_die("ship1");
                }
                if (item.super_bullet == false) {
                    bullets.splice(i, 1);
                }
                boom_sound.play();
            }
        }
        else if (item.x_pos >= ship2_x && item.x_pos + 6 <= ship2_x2 &&
            item.y_pos >= ship2_y && item.y_pos + 25 <= ship2_y2) {
            if (item.owner == "ship1" && ship2_alive) {
                if (ship2_shield == true) {
                    ship2_shield = false;
                }
                else {
                    ship_die("ship2");
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

function load_ingame_bg() {
    for (let i = 0; i < 4; i++) {
        var source = "images/space/space" + (i + 1) + ".png";
        ingame_bg[i].src = source;
    }
}

function ingame_draw() {
    ctx.drawImage(ingame_bg[ingame_bg_num], 0, 0);

    if (started == false) {
        if (ready_pressed == false) {
            draw_ready_button();
        }
        else {
            ready_timer_ms = ready_button_timer(ready_timer_ms);
            if (ready_timer_ms < 13) {
                ready_button_pressed();
                ready_timer_ms = 2999;
            }
        }
    }

    if (ship1_alive) {
        if (ship1_shield) {
            ctx.drawImage(ship1_protected, ship1_x, ship1_y);
        }
        else {
            ctx.drawImage(ship1, ship1_x, ship1_y);
        }
    }
    if (ship2_alive) {
        if (ship2_extras[4] > 0) {
            ctx.drawImage(ship2_invis, ship2_x, ship2_y);
        }
        else if (ship2_shield) {
            ctx.drawImage(ship2_protected, ship2_x, ship2_y);
        }
        else {
            ctx.drawImage(ship2, ship2_x, ship2_y);
        }
    }

    draw_loot();
    draw_bullets();
    draw_fleet();
    draw_sound_icon();
    draw_ayy_timer();
    draw_extras_timer();
    draw_lifes();
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
    ingame_bg_num = getRandomInt(4);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function check_direction() {
    if (started == false) {
        return;
    }

    if (ship1_go_right && ship1_go_left) {
        ship1_direction = 1;
    }
    else if (ship1_go_right) {
        ship1_direction = 1;
    }
    else if (ship1_go_left) {
        ship1_direction = -1;
    }
    else {
        ship1_direction = 0;
    }
}

function shoot(ship, x, y) {
    var cs = can_shoot(ship);
    var bullet_speed = 10;

    if (ship == "ship1") {
        bullet_speed = ship1_bullet_speed;
    }
    else {
        bullet_speed = ship2_bullet_speed;
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

        if (bullet.owner == "ship1") {
            if (ship1_extras[3] > 0) {
                bullet.super_bullet = true;
            }
            if (ship1_extras[5] > 0) {
                bullet.stealth_bullet = true;
            }
        }
        else if (bullet.owner == "ship2") {
            if (ship2_extras[3] > 0) {
                bullet.super_bullet = true;
            }
            if (ship2_extras[5] > 0) {
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
    if (ship == "ship1") {
        if (ship1_bullets_limit <= ship_bullets) {
            bullets_ran_out = true;
        }
    }
    else if (ship == "ship2") {
        if (ship2_bullets_limit <= ship_bullets) {
            bullets_ran_out = true;
        }
    }

    if (started == false) {
        return false;
    }
    else if (bullets_ran_out == true) {
        return false;
    }
    else if (!ship1_alive || !ship2_alive) {
        return false;
    }
    return true;
}

function draw_bullets() {
    bullets.forEach(function (item, i, arr) {
        if (item.stealth_bullet) {
            ctx.globalAlpha = 0.15;
        }

        if (item.owner == "ship1") {
            if (item.super_bullet) {
                ctx.drawImage(super_bullet_img, item.x_pos, item.y_pos);
            }
            else {
                ctx.drawImage(bullet_img, item.x_pos, item.y_pos);
            }
        }
        else {
            if (item.super_bullet) {
                ctx.drawImage(super_bullet_img2, item.x_pos, item.y_pos);
            }
            else {
                ctx.drawImage(bullet_img2, item.x_pos, item.y_pos);
            }
        }

        ctx.globalAlpha = 1;
    });
}

function round_restart() {
    round_vars_init();
}

function ayy_timer_decrease() {
    if (started) {
        ayy_timer += ayy_spawn_interval / 360;
        if (ayy_timer >= ayy_spawn_interval) {
            add_fleet();
            ayy_timer = 0;
        }
    }
    if (ship1_lifes > 0 && ship2_lifes > 0) {
        setTimeout(ayy_timer_decrease, ayy_spawn_interval / 360);
    }
}

function draw_ayy_timer() {
    ctx.drawImage(ayy_img, canv.width - 70, 150, 50, 30);

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
            owner: "ship1",
            x_pos: (ayy_img.width * i) + (ayy_space * i),
            y_pos: (canv.height / 2) + (ayy_img.height / 2),
            dir: 1
        };
        if (i == 0) {
            alien.x_pos += ayy_space / 2;
        }
        if (i % 2 == 1) {
            alien.owner = "ship2";
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
    });
}

function update_fleet() {
    ayy_fleet.forEach(function (item, i, arr) {
        if (item.x_pos < 10 || canv.width - (item.x_pos + ayy_img.width) < 10) {
            if (item.owner == "ship1") {
                item.y_pos += ayy_img.height + 5;
            }
            else {
                item.y_pos -= ayy_img.height + 5;
            }
            item.dir = -item.dir;

            if (item.y_pos < ship2_y2 && ship2_alive) {
                ship_die("ship2");
            }
            else if (item.y_pos > ship1_y && ship1_alive) {
                ship_die("ship1");
            }
        }

        item.x_pos += ayy_speed * item.dir;
    })
}

function fleet_move_side(ship, y, dir) {
    ayy_fleet.forEach(function (item, i, arr) {
        if (item.owner == ship && item.y_pos == y) {
            item.x_pos += ayy_speed * dir;
        }
    })
}

function fleet_move_down(ship, y, dir) {
    var ayy_drop_speed = 5;
    ayy_fleet.forEach(function (item, i, arr) {
        if (item.owner == ship && item.y_pos == y) {
            item.y_pos += ayy_drop_speed * dir;
        }
    })
}

function drop_loot(owner, x, y) {
    var drop_chance = Math.floor(Math.random() * Math.floor(100));
    if (drop_chance >= 75) {
        var drop_chance = Math.floor(Math.random() * Math.floor(100)); // gen new rand

        if (drop_chance <= 25) { // Вернуть на 25
            // 3x bullet
            drop_extra(owner, "3x_bullets", bullets_3x_img, "green", x, y);
        }
        else if (drop_chance <= 45) { // вернуть на 45
            // 2x bullet speed
            drop_extra(owner, "2x_bullets_speed", bullets_speed_img, "green", x, y);
        }
        else if (drop_chance <= 70) { // вернуть на 70
            // 2x ship speed
            drop_extra(owner, "2x_ship_speed", ship_speed_img, "green", x, y);
        }
        else if (drop_chance <= 90) { // вернуть на 90
            // extra life
            drop_extra(owner, "extra_life", life_img, "purple", x, y);
        }
        else if (drop_chance <= 92.5) { // вернуть на 92.5
            // shield
            drop_extra(owner, "shield", shield_img, "purple", x, y);
        }
        else if (drop_chance <= 95) { // вернуть на 95
            // super-bullet
            drop_extra(owner, "super_bullets", super_bullet_img, "gold", x, y);
        }
        else if (drop_chance <= 97.5) { //вернуть на 97.5
            // invision
            drop_extra(owner, "invision", invision_png, "gold", x, y);
        }
        else {
            // half-invis bullets
            drop_extra(owner, "stealth_bullets", stealth_bullet_img, "gold", x, y);
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
    if (owner == "ship1") {
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
        if ((item.y_pos >= ship1_y && item.y_pos <= ship1_y2 &&       // Bonus collide any ship
            item.x_pos + 20 > ship1_x && item.x_pos < ship1_x2) ||
            (item.y_pos >= ship2_y && item.y_pos <= ship2_y2 &&
                item.x_pos + 20 > ship2_x && item.x_pos < ship2_x2)) {
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
        ctx.beginPath();
        ctx.arc(item.x_pos, item.y_pos, 20, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();

        if (item.name == "2x_ship_speed") {
            ctx.drawImage(item.image, img_x - 11, item.y_pos - 14, 30, 30);
        }
        else if (item.name == "extra_life") {
            ctx.drawImage(item.image, img_x - 10, item.y_pos - 14, 30, 30);
        }
        else if (item.name == "shield") {
            ctx.drawImage(item.image, img_x - 10, item.y_pos - 14, 30, 30);
        }
        else if (item.name == "invision") {
            ctx.drawImage(invision_png, img_x - 7, item.y_pos - 13, 25, 25)
        }
        else {
            ctx.drawImage(item.image, img_x + 2, item.y_pos - 14);
        }
    })
}

function give_extra(name, owner) {
    if (owner == "ship1") {
        switch (name) {
            case "3x_bullets":
                ship1_bullets_limit = 3;
                ship1_extras[0] = extras_length;
                break;
            case "2x_bullets_speed":
                ship1_bullet_speed = 20;
                ship1_extras[1] = extras_length;
                break;
            case "2x_ship_speed":
                ship1_speed = 15;
                ship1_extras[2] = extras_length;
                break;
            case "extra_life":
                if (ship1_lifes < 3) {
                    ship1_lifes++;
                }
                break;
            case "shield":
                ship1_shield = true;
                break;
            case "super_bullets":
                ship1_extras[3] = extras_length;
                break;
            case "invision":
                ship1_extras[4] = extras_length;
                break;
            case "stealth_bullets":
                ship1_extras[5] = extras_length;
                break;
        }
    }
    else {
        switch (name) {
            case "3x_bullets":
                ship2_bullets_limit = 3;
                ship2_extras[0] = extras_length;
                break;
            case "2x_bullets_speed":
                ship2_bullet_speed = 20;
                ship2_extras[1] = extras_length;
                break;
            case "2x_ship_speed":
                ship2_speed = 15;
                ship2_extras[2] = extras_length;
                break;
            case "extra_life":
                if (ship2_lifes < 3) {
                    ship2_lifes++;
                }
                break;
            case "shield":
                ship2_shield = true;
                break;
            case "super_bullets":
                ship2_extras[3] = extras_length;
                break;
            case "invision":
                ship2_extras[4] = extras_length;
                break;
            case "stealth_bullets":
                ship2_extras[5] = extras_length;
                break;
        }
    }
}

function extras_timer() {
    for (var i = 0; i < ship1_extras.length; i++) {
        if (ship1_extras[i] > 0) {
            ship1_extras[i] -= 50;
        }
        if (ship2_extras[i] > 0) {
            ship2_extras[i] -= 50;
        }
    }
    if (started) {
        setTimeout(extras_timer, 50);
    }
}

function draw_extras_timer() {
    var extra_y = 200;
    var extra_imgs = [bullets_3x_img, bullets_speed_img, ship_speed_img, super_bullet_img, invision_png, stealth_bullet_img];
    for (var i = 0; i < ship1_extras.length; i++) {
        if (ship1_extras[i] > 0) {
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
            ctx.arc(70, extra_y, extra_line_width, 1.5 * Math.PI, (ship1_extras[i] / (extras_length / 360) * 0.01745 + 1.5 * Math.PI));
            ctx.stroke();
            ctx.closePath();

            ctx.drawImage(extra_imgs[i], img_x, extra_y - 14, x_size, y_size);

            extra_y += 75;
        }
    }
}

function extras_end_check() {
    // ship1
    if (ship1_extras[0] == 0) {
        ship1_bullets_limit = 1;
    }
    if (ship1_extras[1] == 0) {
        ship1_bullet_speed = 10;
    }
    if (ship1_extras[2] == 0) {
        ship1_speed = 10;
    }

    // ship2
    if (ship2_extras[0] == 0) {
        ship2_bullets_limit = 1;
    }
    if (ship2_extras[1] == 0) {
        ship2_bullet_speed = 10;
    }
    if (ship2_extras[2] == 0) {
        ship2_speed = 10;
    }
}

function draw_lifes() {
    var img_x = canv.width - life_img.width - 30;
    var img_y = sound_icon_y + 100;

    for (var i = 0; i < ship1_lifes; i++) {
        ctx.drawImage(life_img, img_x, img_y + (life_img.height * i));
    }
}

function check_win() {
    if (ship1_lifes == 0 || ship2_lifes == 0) {
        radio.load();
        init();
    }

    if (ship1_lifes == 0) {
        alert('YOU LOSE!');
    }
    else if (ship2_lifes == 0) {
        alert('YOU WIN!');
    }
}

function ship_die(ship) {
    if (ship == "ship1") {
        ship1_alive = false;
        ship1_lifes--;
    }
    else {
        ship2_alive = false;
        ship2_lifes--;
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
    ai_enable();
    extras_timer();
    mouse_on = '';
}

function ready_button_timer(ms) {
    console.log('uwu')
    ctx.font = "bold 100pt Sans-serif";
    ctx.fillText(Math.floor(ms / 1000) + 1, 500, 420);
    ms -= 13;

    return ms;
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
        if (item.owner == "ship1") {
            ai_danger_lines.push(item.x_pos);
        }
    });

    ai_danger_level = 0;
    ai_state = '';
    ship2_direction = 0;

    if ((ship2_x >= ship1_x && ship2_x <= ship1_x2) ||
        (ship2_x2 >= ship1_x && ship2_x2 <= ship1_x2) &&
        ship1_extras[4] == 0) {
        ai_danger_level = 2;
    };

    ai_danger_lines.forEach(function (item, i, arr) {
        if (item >= ship2_x - 12 && item + 18 <= ship2_x2) {
            ai_danger_level = 3;
        }
    });

    // Don't stay in corner
    /* if (ship2_x2 >= canv.width - (ship2.width * 2) ||
        ship2_x <= ship2.width * 2) {
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

    var ship2_center = ship2_x + (ship2.width / 2);
    if (Math.abs(evade_center - ship2_center) < ship2_speed) {
        ship2_direction = 0;
        ai_shoot();
    }
    else if (ship2_center < evade_center) {
        ship2_direction = 1;
        ai_shoot();
    }
    else if (ship2_center > evade_center) {
        ship2_direction = -1;
        ai_shoot();
    }

    var bullets_clear = true;
    bullets.forEach(function (item, i, arr) {
        if (item.owner == "ship1") {
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
    if (ship1_extras[4] > 0) {
        ai_evade();
        return;
    }

    ship2_center = ship2_x + ((ship2_x2 - ship2_x) / 2);
    ship1_center = ship1_x + ((ship1_x2 - ship1_x) / 2);
    ai_preemption = ((ship1_y2 - ship2_y) / ship2_bullet_speed) * (ship1_speed * ship1_direction); // X distance to shoot
    shoot_pos = ship1_center + ai_preemption;

    if (ship2_x <= ship2_speed || ship2_x2 >= canv.width - ship2_speed) {
        ai_shoot();
    }
    if (Math.abs(ship2_center - shoot_pos) < ship2_speed) {
        ai_shoot();
    }
    else if (ship2_center > shoot_pos) {
        ship2_direction = -1;
        ai_shoot();
    }
    else if (ship2_center < shoot_pos) {
        ship2_direction = 1;
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
        if (ayy_fleet[i].owner == "ship2") {
            ai_ayy_target = i;
            break;
        }
    }

    var ai_ayy_target_y_center = ayy_fleet[ai_ayy_target].y_pos + (ayy_img.height / 2)
    var ai_ayy_preemption = ((ai_ayy_target_y_center - ship2_y2) / ship2_bullet_speed) * (ayy_speed * ayy_fleet[ai_ayy_target].dir);
    var ai_ayy_shoot_point = (ayy_fleet[ai_ayy_target].x_pos + (ayy_img.width / 2)) + ai_ayy_preemption;

    if (Math.abs((ship2_x + (ship2.width / 2)) - ai_ayy_shoot_point) < ship2_speed) {
        ai_shoot();
    }
    else if (ship2_x + (ship2.width / 2) > ai_ayy_shoot_point) {
        ship2_direction = -1;
    }
    else {
        ship2_direction = 1;
    }

}

function ai_is_any_ship2_loot(item, i, arr) {
    if (item.owner == "ship2") {
        return true;
    }
    else return false;
}

function ai_pick_loot() {
    var target_loot_x = extras.findIndex(ai_is_any_ship2_loot); // x center
    target_loot_x = extras[target_loot_x].x_pos;

    /* extras.forEach(function (item, i, arr) {
        if (item.owner == "ship2") {
            target_loot_x = item.x;
            break;
        }
    }); */

    if (Math.abs(ship2_x + (ship2.width / 2) - target_loot_x) < 10) {
        ai_shoot();
    }
    else if (ship2_x + (ship2.width / 2) < target_loot_x) {
        ship2_direction = 1;
    }
    else {
        ship2_direction = -1;
    }
}

function ai_shoot() {
    if (ai_shoot_cooldown == 0) {
        shoot("ship2", ship2_x + (ship2.width / 2), ship2_y2);
        ai_shoot_cooldown = 200;
    }
    setTimeout(function () {
        ai_shoot_cooldown = 0;
    }, 200);
    /* if (ship2_bullets_limit == 3) {
        setTimeout(shoot("ship2", ship2_x + (ship2.width / 2), ship2_y2), 100);
        setTimeout(shoot("ship2", ship2_x + (ship2.width / 2), ship2_y2), 200);
    } */
}