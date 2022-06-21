"use strict";
let tableRec = document.getElementById('tableRecords');
let textRec = document.getElementById('records');
let butRec = document.getElementById("infoRecords");

let fieldGame = document.getElementById('fieldGame');
let field = document.createElementNS("http://www.w3.org/2000/svg", 'rect');

let score = 0;
let spanScore = document.getElementById('Score');
spanScore.innerHTML = score;

let fieldH = {
    posX: 0,
    posY: 0,
    width: 500,
    height: 800
};

field.setAttribute("fill", "#24375e");
field.setAttribute("x", "0");
field.setAttribute("y", "0");
field.setAttribute("width", "500");
field.setAttribute("height", "800");
fieldGame.appendChild(field);

let RAF =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) { window.setTimeout(callback, 1000 / 60); }
    ;


let fieldTextH = {
    posX: fieldH.width / 5,
    posY: fieldH.height * 3 / 7,
    width: fieldH.width * 3 / 5,
    height: fieldH.height / 7,
}

let ballCenter = document.createElementNS("http://www.w3.org/2000/svg", 'circle');

let colorsBall = ['#eb3017', '#eff233', '#2bb539', '#17ddeb', '#2c31d1', '#eb46da']; // массив с цветами шариков
let remainingColors; //оставшиеся цвета


// функция для случайного выбора цвета
function randomDiap(n, m) {
    return Math.floor(Math.random() * (m - n + 1)) + n;
}

let colorBallC = colorsBall[randomDiap(0, colorsBall.length - 1)]; // цвет центрального шара

let ballCenterH = {
    r: fieldH.width / 20,
    posX: fieldH.width / 2,
    posY: fieldH.height / 10 * 9,
    speedX: 0,
    speedY: 0,
    color: colorBallC,
    visible: false,
    s: -20, // расстояние, которое проходит шарик в момент времени
    update: function () {
        // рисуем внизу шар 

        ballCenter.setAttribute("r", this.r);
        ballCenter.setAttribute("cx", this.posX); // центр центрального шарика
        ballCenter.setAttribute("cy", this.posY);

        ballCenter.setAttribute("fill", this.color);
        fieldGame.appendChild(ballCenter);
    }
}

let ballsH = {
    columns: 10,
    columnsEven: 10,
    columnsOdd: 9,
    rows: 8,
    rowsPic: 15,
    r: fieldH.width / 20,
    balls: [],
    sBalls: Math.sqrt(3) * fieldH.width / 20, // this.r расстояние по оси y между центрами шариков
}

function Tile(x, y, color, opacity, status) {
    let self = this;

    self.x = x;
    self.y = y;
    self.r = fieldH.width / 20;
    self.color = color;
    self.status = status;
    self.processed = false;
    self.opacity = opacity;
    self.ball = 0;


    self.draw = function () {
        let ball = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        self.ball = ball;

        ball.setAttribute("r", self.r);//ballsH.balls[st][c].r) //ballsH.r);
        ball.setAttribute("cx", self.x);// ballsH.balls[st][c].x);
        ball.setAttribute("cy", self.y); //ballsH.balls[st][c].y);
        ball.setAttribute("fill", self.color); //ballsH.balls[st][c].color);
        ball.setAttribute("fill-opacity", self.opacity);//ballsH.balls[st][c].opacity);
        fieldGame.appendChild(ball);
    }

    self.update = function () {
        self.ball.setAttribute("fill-opacity", this.opacity);
    }
}

let family = []; // семья из шаров одинаковых цветов
let floatingFamily = [];

// смещение соседей
let neighborsOffsets = [[[-1, -1], [-1, 0], [0, 1], [1, 0], [1, -1], [0, -1]],// четная строка
[[-1, 0], [-1, 1], [0, +1], [1, 1], [1, 0], [0, -1]]]; // нечетная строка


let gameState = 0; //0-начало игры, 1-шарик летит, 2-конец игры

let ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
let records; // хэш {name: 'имя', score: 'очки'}
let updatePassword;
let stringName = 'BAK_BUBBLE_RECORD';

let popAudio = new Audio;
if (popAudio.canPlayType("audio/mpeg") == "probably")
    popAudio.src = "http://web.mit.edu/sahughes/www/Sounds/m=100.mp3";
else
    popAudio.src = "m=100.ogg";


function init() {
    for (let st = 0; st < ballsH.rowsPic; st++) {
        ballsH.balls[st] = [];
        for (let c = 0; c < ballsH.columns; c++) {
            ballsH.balls[st][c] = new Tile(0, 0, 0, 0, 0);//{ x: 0, y: 0, r: fieldH.width / 20, color: 0, status: 0, processed: false, opaсity: 1 } // status: 1-шарик нарисован?, 0- место пустое
        }
    }

    //строим массив из разноцветных шаров
    function drawBalls() {
        for (let st = 0; st < ballsH.rows; st++) {

            for (let c = 0; c < ballsH.columns; c++) {
                let ballX = ballsH.r * 2 * c + ballsH.r;
                // если строка нечетная
                if (st % 2 == 1) {
                    ballsH.columns = ballsH.columnsOdd;
                    ballX = ballsH.r * 2 * c + ballsH.r * 2;
                }
                else {
                    ballsH.columns = ballsH.columnsEven;
                }

                let ballY = ballsH.sBalls * st + ballsH.r;

                let colorBall = colorsBall[randomDiap(0, colorsBall.length - 1)];
                ballsH.balls[st][c] = new Tile(ballX, ballY, colorBall, 1, 1);

                /* ballsH.balls[st][c].x = ballX;
                 ballsH.balls[st][c].y = ballY;
                 ballsH.balls[st][c].color = colorBall;
                 ballsH.balls[st][c].status = 1;
                 ballsH.balls[st][c].opacity = fillOpacity;*/

                ballsH.balls[st][c].draw();

                /*  let ball = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
                 ballsH.balls[st][c].ball = ball;
     
                 ball.setAttribute("r", ballsH.balls[st][c].r);//ballsH.balls[st][c].r) //ballsH.r);
                 ball.setAttribute("cx", ballsH.balls[st][c].x);// ballsH.balls[st][c].x);
                 ball.setAttribute("cy", ballsH.balls[st][c].y); //ballsH.balls[st][c].y);
                 ball.setAttribute("fill", ballsH.balls[st][c].color); //ballsH.balls[st][c].color);
                 ball.setAttribute("fill-opacity", ballsH.balls[st][c].opacity);//ballsH.balls[st][c].opacity);
                 fieldGame.appendChild(ball);*/
            }
        }

    }

    drawBalls(); // рисуем массив из разноцветных шаров

    ballsH.columns = ballsH.columnsEven;
    // стрелка и шар посередине 
    let arrow = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    arrow.setAttribute("x1", fieldH.width / 2);
    arrow.setAttribute("y1", fieldH.height / 10 * 9);
    arrow.setAttribute("x2", fieldH.width / 2);
    arrow.setAttribute("y2", fieldH.height / 4 * 3);
    arrow.setAttribute("stroke", '#67a8d6');
    arrow.setAttribute("stroke-width", ballsH.r / 8);
    fieldGame.appendChild(arrow);

    let ball0 = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    ball0.setAttribute("r", fieldH.width / 20);
    ball0.setAttribute("cx", fieldH.width / 2); // центр центрального шарика
    ball0.setAttribute("cy", fieldH.height / 10 * 9);
    fieldGame.appendChild(ball0);

    butRec.addEventListener("click", switchToRecords, false); // butRec.addEventListener("click", showTable, false);
    readRecords();

    function svgPoint(element, x, y) {
        let pt = fieldGame.createSVGPoint();
        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(element.getScreenCTM().inverse());
    }

    // по движению мыши движется стрелка
    fieldGame.addEventListener('mousemove', goArrow, false);

    fieldGame.addEventListener('touchmove', goArrow, false);
    fieldGame.addEventListener('touchstart', goArrow, false);

    function goArrow(EO) {
        EO = EO || window.event;
        EO.preventDefault();
        let svgM;

        if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch)
            svgM = svgPoint(fieldGame, EO.targetTouches[0].clientX, EO.targetTouches[0].clientY);
        else
            svgM = svgPoint(fieldGame, EO.clientX, EO.clientY);

        let moveX = svgM.x - fieldH.width / 2;
        let moveY = fieldH.height / 10 * 9 - svgM.y;
        let atg = Math.atan2(moveX, moveY); // арктангенс в радианах
        let angle = atg * 360 / (Math.PI * 2);

        // не опускается ниже 85 градусов или -85 градусов
        if (angle > 85) {
            angle = 85
        }

        if (angle < -85) {
            angle = -85
        }

        arrow.style.transform = 'rotate(' + angle + 'deg)'; // поворот стрелки
        arrow.style.transformOrigin = "50% 90%";

    }

    if (gameState == 0) {
        // по клику летит центральный шар
        fieldGame.addEventListener('click', goBall, false);
        fieldGame.addEventListener('touchend', goBall, false);
    }


    RAF(tick);

    function tick() {

        ballCenterH.posX += ballCenterH.speedX;
        ballCenterH.posY += ballCenterH.speedY;

        // шарик выходит за пределы поля

        function outside() {
            if (fieldH.posX > (ballCenterH.posX - ballCenterH.r)) {
                ballCenterH.speedX = -ballCenterH.speedX;
                ballCenterH.posX = fieldH.posX + ballCenterH.r;

            }

            if ((fieldH.posX + fieldH.width) < (ballCenterH.posX + ballCenterH.r)) {
                ballCenterH.speedX = -ballCenterH.speedX;
                ballCenterH.posX = fieldH.posX + fieldH.width - ballCenterH.r;
            }


            if ((fieldH.posY + fieldH.height) < (ballCenterH.posY + ballCenterH.r)) {
                ballCenterH.speedY = -ballCenterH.speedY;
                ballCenterH.posY = fieldH.posY + fieldH.height - ballCenterH.r;
            }

            if (fieldH.posY > (ballCenterH.posY - ballCenterH.r)) {
                stickBall();
                //  return; //???
            }
        }



        outside(); // шар выходит за пределы поля 
        collisionDetection();// обнаружение столкновений
        ballCenterH.update();

        RAF(tick);

    }

    function goBall(EO) {

        EO = EO || window.event;
        EO.preventDefault();

        let svgC;
        if (('ontouchend' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
            let touch = EO.changedTouches[0];
            svgC = svgPoint(fieldGame, touch.clientX, touch.clientY);
        }
        else
            svgC = svgPoint(fieldGame, EO.clientX, EO.clientY);

        let clickX = svgC.x - fieldH.width / 2;
        let clickY = fieldH.height / 10 * 9 - svgC.y;
        let atgClick = Math.atan2(clickX, clickY);

        ballCenterH.speedX = -Math.sin(atgClick) * ballCenterH.s;
        ballCenterH.speedY = Math.cos(atgClick) * ballCenterH.s;

        // если клик ниже 85 градусов или -85 градусов, мячик не стреляет
        if (atgClick > (85 * Math.PI * 2 / 360) || atgClick < (-85 * Math.PI * 2 / 360)) {
            ballCenterH.speedX = 0;
            ballCenterH.speedY = 0;
        }

        remainingColors = findColors();
        gameState = 1; // шар летит

        popSoundInit();

    }



    // обнаружение столкновений 
    function collisionDetection() {
        for (let st = 0; st < ballsH.rowsPic; st++) {
            for (let c = 0; c < ballsH.columns; c++) {
                let b = ballsH.balls[st][c];
                if (b.status == 0) {
                    continue;
                }

                if (circleIntersection(ballCenterH.posX, ballCenterH.posY, ballCenterH.r, b.x, b.y, b.r)) {
                    stickBall();
                    return;
                }

                //console.log(circleIntersection(ballCenterH.posX, ballCenterH.posY, ballCenterH.r, b.x, b.y, b.r));
            }
        }
    }


    //добавление шарика в массив шаров
    function stickBall() {

        ballCenterH.speedY = 0;
        ballCenterH.speedX = 0;

        gameState = 2; // шар прилетел

        // tuckSound();
        let gridpos = getPosition(ballCenterH.posX, ballCenterH.posY); // получим хэш с номером столбца и строки

        if (gridpos.x < 0) {
            gridpos.x = 0;
        }

        if (gridpos.y < 0) {
            gridpos.y = 0;
        }


        if (gridpos.y >= ballsH.rowsPic) {
            gameState = 3;
            gameStates();
            gameOver(score);
        }

        //нарисовать новый шарик
        let pos = getCoordinate(gridpos.x, gridpos.y);

        let colorBall = ballCenterH.color;
        ballsH.balls[gridpos.y][gridpos.x] = new Tile(pos.x, pos.y, colorBall, 1, 1) //{ x: pos.x, y: pos.y, r: fieldH.width / 20, color: colorBall, status: 1, opacity: 1 };

        ballsH.balls[gridpos.y][gridpos.x].draw();

        // найти семьи одинаковых шариков
        family = findFamily(gridpos.y, gridpos.x, true, true); //(gridpos.x, gridpos.y, true, true, false);

        if (family.length >= 3) {
            // удаляем семью одинаковых шариков
            for (let i = 0; i < family.length; i++) {
                // анимированно удалить их с экрана
                let delBall = family[i];
                let delGrid = getPosition(delBall.x, delBall.y);


                popSound();
                vibro();

                function setOpacity() {
                    ballsH.balls[delGrid.y][delGrid.x].opacity -= 0.1;
                    ballsH.balls[delGrid.y][delGrid.x].ball.setAttribute("fill-opacity", ballsH.balls[delGrid.y][delGrid.x].opacity);

                    if (ballsH.balls[delGrid.y][delGrid.x].opacity <= 0) {
                        ballsH.balls[delGrid.y][delGrid.x].opacity = 0;
                        return;

                    }

                    RAF(setOpacity);

                }
                console.log(ballsH.balls[delGrid.y][delGrid.x].ball);
                fieldGame.removeChild(ballsH.balls[delGrid.y][delGrid.x].ball);
                ballsH.balls[delGrid.y][delGrid.x] = new Tile(0, 0, 0, 0, 0, 0); //{ x: 0, y: 0, r: fieldH.width / 20, color: 0, status: 0, processed: false };// удалить из хэша

                score += 100;

            }

        }

        floatingFamily = findFloatingFamily();

        if (floatingFamily.length > 0) {

            for (var i = 0; i < floatingFamily.length; i++) { // количество плавающих семей
                for (var j = 0; j < floatingFamily[i].length; j++) { // количество шариков в семье
                    let float = floatingFamily[i][j];
                    let floatGrid = getPosition(float.x, float.y);
                    // float.x += 1;
                    // console.log(float.x);
                    //  ballsH.balls[floatGrid.y][floatGrid.x].ball.setAttribute("cx", float.x);
                    //  ballsH.balls[floatGrid.y][floatGrid.x].ball.setAttribute("fill-opacity", '0');
                    fieldGame.removeChild(ballsH.balls[floatGrid.y][floatGrid.x].ball);

                    ballsH.balls[floatGrid.y][floatGrid.x] = new Tile(0, 0, 0, 0, 0, 0);

                    score += 150;
                }
            }

        }

        gameState = 0;
        remainingColors = findColors();

        if (remainingColors.length == 0) {
            gameState = 3;
            gameStates();
            gameOver(score);

        }

        drawCenterBall();
        spanScore.innerHTML = score;

    }

    ballCenterH.update();

}

init();

function popSoundInit() {
    popAudio.play();
    popAudio.pause();
}

function popSound() {
    popAudio.currentTime = 0;
    popAudio.play();
}


// пересекаются ли 2 окружности
function circleIntersection(x1, y1, r1, x2, y2, r2) {
    // Calculate the distance between the centers
    var dx = x1 - x2;
    var dy = y1 - y2;
    var len = Math.sqrt(dx * dx + dy * dy);

    if (len < r1 + r2) {
        // пересекаются
        return true;
    }
    return false;
}

// все шары необработанные
function resetProcessed() {
    for (var i = 0; i < ballsH.rowsPic; i++) {
        for (var j = 0; j < ballsH.columns; j++) {
            ballsH.balls[i][j].processed = false;
        }
    }
}

function getPosition(x, y) { // получает позицию шара по оси x и y в единицах и возвращвеи номер строки и номер столбца
    let gridY = Math.round((y - ballsH.r) / ballsH.sBalls); // номер строки
    let gridX; // номер столбца

    // если строка нечетная
    if (gridY % 2 == 1) {
        gridX = Math.floor((x - ballsH.r) / (ballsH.r * 2));
        if (gridX >= ballsH.columnsOdd)
            gridX = ballsH.columnsOdd - 1

    } else {
        gridX = Math.floor(x / (ballsH.r * 2));


    }
    return { x: gridX, y: gridY };
}

//функция перевода из грид координат в svg-координаты
function getCoordinate(col, str) {

    let posY = ballsH.sBalls * str + ballsH.r;
    let posX;
    if (str % 2 == 1) {
        posX = col * ballCenterH.r * 2 + ballsH.r * 2;
    }
    else {
        posX = col * ballCenterH.r * 2 + ballsH.r;
    }
    return { x: posX, y: posY }
}

// функция получает номер строки и столбца и возвращвет массив соседей шарика (может лучше шарик bubble)
function addNeighbors(currentBall) {
    let arrGrid = getPosition(currentBall.x, currentBall.y); // массив с номерами столбца и строки целевого шарика
    let str = arrGrid.y;
    let col = arrGrid.x;
    let neighbors = []; //массив соседей
    let n = str % 2; //четная или нечетная строка
    let offset = neighborsOffsets[n];
    for (let i = 0; i < offset.length; i++) {
        //строка и столбец соседа
        let strN = str + offset[i][0];
        let colN = col + offset[i][1];

        if ((strN % 2 == 0 && colN >= 0 && colN < ballsH.columnsEven && strN >= 0 && strN < ballsH.rowsPic) || (strN % 2 == 1 && colN >= 0 && colN < ballsH.columnsOdd && strN >= 0 && strN < ballsH.rowsPic)) {
            neighbors.push(ballsH.balls[strN][colN]);
        }
    }
    return neighbors;
}

// найти семью цветов по указанным координатам шарика
function findFamily(st, c, matchtype, reset) {//, reset) { // ct-строка, c-номер столбца (st, c, matchtype, reset, skipremoved) 
    // снять обработку
    if (reset) {
        resetProcessed(); // если обработаны, то все необработаны
    }

    let targetBall = ballsH.balls[st][c];// целевой шарик
    let arrProcess = [targetBall];// массив с указанным шаром
    targetBall.processed = true;
    let foundFamily = []; // массив с найденными шарами одного цвета

    while (arrProcess.length > 0) {
        let currentBall = arrProcess.pop(); // удаляем последний эл-т массива и его возвращаем

        // пропускать обработанные и пустые шары
        if (currentBall.status == 0) {
            continue;
        }

        // пропускать шары со снятым флагом ???

        if (!matchtype || currentBall.color == targetBall.color) { //соответствующий тип или цвет
            foundFamily.push(currentBall); // добавить текущий шар в семью
            let neighbors = addNeighbors(currentBall); //получаем массив соседей целевого шара 

            // проверяем тип каждого соседа
            for (let i = 0; i < neighbors.length; i++) {
                if (!neighbors[i].processed) {
                    // добавить соседей в массив toprocess 
                    arrProcess.push(neighbors[i]);
                    neighbors[i].processed = true;
                }
            }
        }
    }
    return foundFamily;
}

// ищем плавающие шарики
function findFloatingFamily() {
    resetProcessed();
    let foundFamily = [];

    // проверить все шарики
    for (let st = 0; st < ballsH.rowsPic; st++) {
        for (let c = 0; c < ballsH.columns; c++) {


            let tile = ballsH.balls[st][c];

            if (!tile.processed) {
                // найти все прикрепленные шарики
                let foundBall = findFamily(st, c, false, false);
                if (foundBall.length <= 0) {
                    continue;
                }

                // проверяем, является ли кластер плавающим
                let floating = true;
                for (let k = 0; k < foundBall.length; k++) {
                    if (foundBall[k].y == ballsH.r) {
                        // шарик прикреплен к верху
                        floating = false;
                        break;
                    }
                }

                if (floating) {
                    // находим семью плавающих шариков                   
                    foundFamily.push(foundBall);
                }
            }
        }
    }

    return foundFamily;
}

function drawCenterBall() {
    ballCenterH.visible = true;
    ballCenterH.posX = fieldH.width / 2;
    ballCenterH.posY = fieldH.height / 10 * 9;
    ballCenterH.color = remainingColors[randomDiap(0, remainingColors.length - 1)];
}

// возвращает массив с оставшиемися цветами
function findColors() {
    let remainColors = [];// массив цветов, которые есть на экране
    for (let i = 0; i < ballsH.rowsPic; i++) {
        for (let j = 0; j < ballsH.columns; j++) {

            let color = ballsH.balls[i][j].color;
            if (!color == 0) {
                if (remainColors.indexOf(color) == -1) {
                    remainColors.push(color);
                }
            }
        }
    }
    return remainColors;
}

function gameStates() {

    let fieldText = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    fieldText.setAttribute("x", fieldTextH.posX);
    fieldText.setAttribute("y", fieldTextH.posY);
    fieldText.setAttribute("width", fieldTextH.width);
    fieldText.setAttribute("height", fieldTextH.height);
    fieldText.setAttribute("fill", "white");
    fieldGame.appendChild(fieldText);

    let text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    text.setAttribute("x", (fieldTextH.posX + fieldTextH.width / 4));
    text.setAttribute("y", (fieldTextH.posY + fieldTextH.height * 2 / 5));
    text.setAttribute("fill", "black");
    text.textContent = 'Игра окончена';
    fieldGame.appendChild(text);

}

function gameOver() {

    storeInfo();
    function storeInfo() {
        updatePassword = Math.random();

        $.ajax({
            url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
            data: { f: 'LOCKGET', n: stringName, p: updatePassword },
            success: lockGetReady, error: errorHandler
        }
        );
    }

    function lockGetReady(callresult) {

        if (callresult.error != undefined)
            alert(callresult.error);
        else {
            console.log('есть', callresult.result);
            records = [];

            if (callresult.result != "") {
                records = JSON.parse(callresult.result);
            }
            console.log(records);

            if (records.length < 10) {
                let namePlayer = prompt('Вы вошли в 10-ку лучших игроков. Введите Ваше имя');

                records.push({ name: namePlayer, scoreP: score });
                records.sort((a, b) => b.scoreP - a.scoreP);

            }

            else {
                console.log(records.length);
                if (records[records.length - 1].scoreP < score) {
                    let namePlayer = prompt('Вы вошли в 10-ку лучших игроков. Введите Ваше имя');
                    records.push({ name: namePlayer, scoreP: score });
                    records.sort((a, b) => b.scoreP - a.scoreP);

                    if (records.length > 10)
                        records.pop();

                }

            }
            showRecords();
        }


        $.ajax({
            url: ajaxHandlerScript,
            type: 'POST', dataType: 'json',
            data: {
                f: 'UPDATE', n: stringName,
                v: JSON.stringify(records), p: updatePassword
            },
            cache: false,
            success: updateReady,
            error: errorHandler
        }
        );

    }

}

function showTable() {
    if (tableRec.style.zIndex == -1)
        tableRec.style.zIndex = '2';
    else
        tableRec.style.zIndex = '-1';
}

function readRecords() {

    $.ajax(
        {
            url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
            data: { f: 'READ', n: stringName },
            success: readReady, error: errorHandler
        }
    );

}

function readReady(callresult) {

    if (callresult.error != undefined)
        alert(callresult.error);
    else {
        records = [];
        records = JSON.parse(callresult.result);
        showRecords();

    }
}

function showRecords() {
    let record = '';
    for (let r = 0; r < records.length; r++) {
        record += "<b>" + (r + 1) + '. ' + records[r].name + ': ' + "</b>" + records[r].scoreP + "<br>";

    }
    textRec.innerHTML = record;

    console.log(record);
}

function updateReady(callresult) {
    if (callresult.error != undefined)
        alert(callresult.error);
}

function errorHandler(jqXHR, statusStr, errorStr) {
    alert(statusStr + ' ' + errorStr);
}

function vibro() {
    if (navigator.vibrate) {
        window.navigator.vibrate(100);
    }
}


window.onhashchange = switchToStateFromURLHash;
let SPAState = {};
function switchToStateFromURLHash() {
    let URLHash = window.location.hash;
    let stateStr = URLHash.substring(1);

    if (stateStr != "")
        SPAState = { pagename: stateStr }
    else
        SPAState = { pagename: '' };
    switch (SPAState.pagename) {
        case '':
            tableRec.style.zIndex = -1;
            break;
        case 'Records':
            tableRec.style.zIndex = 2;
            break;
    }

}

function switchToState(newState) {
    let stateSTR = newState.pagename;
    location.hash = stateSTR;

}

function switchToRecords() {
    console.log('работаю');
    switchToState({ pagename: 'Records' });
}

switchToStateFromURLHash();

window.onbeforeunload = befUnload;

function befUnload(EO) {
    EO = EO || window.event;
    EO.returnValue = 'А у вас есть несохранённые изменения!';
};

