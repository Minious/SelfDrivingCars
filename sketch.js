let startPos = {x: 150, y: 80};

let cars;

let up = false;
let left = false;
let right = false;

let neat;
var Neat = neataptic.Neat;
var Architect = neataptic.Architect;
var Methods = neataptic.Methods;

let PLAYER_AMOUNT = 100;
let MUTATION_RATE = 0.3;
let ELITISM_PERCENT = 0.1;
let START_HIDDEN_SIZE = 0;

let pause = true;
let simulationSpeed = 1;
let showSimulation = true;
let showVision = false;

let newPath = [];

let paths = [
  [
    {x: 100, y: 100},
    {x: 50, y: 200},
    {x: 100, y: 300},
    {x: 200, y: 350},
    {x: 300, y: 300},
    {x: 300, y: 200},
    {x: 250, y: 100},
    {x: 150, y: 50},
	],
  [
    {x: 120, y: 130},
    {x: 90, y: 200},
    {x: 130, y: 280},
    {x: 200, y: 310},
    {x: 270, y: 280},
    {x: 260, y: 200},
    {x: 230, y: 130},
    {x: 160, y: 100},
  ],
];

function setup() {
  initNeat();

  startEvaluation();

  createCanvas(1200, 600);
}

function allDead(){
  return cars.every(car => car.isDead);
}

function maxScore(){
  return cars.map(car => car.getScore()).reduce((acc, cur) => Math.max(cur, acc), 0);
}

function initNeat(){
  neat = new Neat(
    Car.nbVisions,
    2,
    null,
    {
      mutation: [
        Methods.Mutation.ADD_NODE,
        Methods.Mutation.SUB_NODE,
        Methods.Mutation.ADD_CONN,
        Methods.Mutation.SUB_CONN,
        Methods.Mutation.MOD_WEIGHT,
        Methods.Mutation.MOD_BIAS,
        Methods.Mutation.MOD_ACTIVATION,
        Methods.Mutation.ADD_GATE,
        Methods.Mutation.SUB_GATE,
        Methods.Mutation.ADD_SELF_CONN,
        Methods.Mutation.SUB_SELF_CONN,
        Methods.Mutation.ADD_BACK_CONN,
        Methods.Mutation.SUB_BACK_CONN
      ],
      popsize: PLAYER_AMOUNT,
      mutationRate: MUTATION_RATE,
      elitism: Math.round(ELITISM_PERCENT * PLAYER_AMOUNT),
      network: new Architect.Random(
        Car.nbVisions,
        START_HIDDEN_SIZE,
        2
      )
    }
  );

  //if(USE_TRAINED_POP) neat.population = population;
}

function startEvaluation(){
  cars = [];

  for(var genome in neat.population){
    cars.push(new Car(startPos.x, startPos.y, neat.population[genome]));
  }
}

function endEvaluation(){
  cars.forEach(car => {
    if(!car.isDead){
      car.dead();
    }
  });

  neat.sort();
  var newPopulation = [];

  // Elitism
  for(var i = 0; i < neat.elitism; i++){
    newPopulation.push(neat.population[i]);
    console.log("elitism " + i);
  }

  // Breed the next individuals
  for(var i = 0; i < neat.popsize - neat.elitism; i++){
    newPopulation.push(neat.getOffspring());
  }

  // Replace the old population with the new population
  neat.population = newPopulation;
  neat.mutate();

  neat.generation++;
  startEvaluation();
}

function updateSimulation(){
  if(allDead()){
    endEvaluation();
  }

  cars.forEach(car => {
    if(!car.isDead){
      let acc = 0;
      let dir = 0;
      /*
      if (up)
        acc = 1;
      if (left)
        dir += -1;
      if (right)
        dir += 1;
      */
      let visionValues = car.getVisionValues(paths);
      visionValues = visionValues.map(visionValue => !!visionValue ? visionValue : 0);
      //console.log(car.brain);
      let output = car.brain.activate(visionValues);

      /*
      acc = map(output[0], 0, 1, Car.minSpeed, 1);
      dir = map(output[1], 0, 1, -1, 1);
      */

      acc = 1;
      dir = output[1] - output[0];

      if(acc < Car.minSpeed || acc > 1 || dir < -1 || dir > 1){
        car.dead();
      }
      if(!car.isDead){
        car.move(acc, dir);
        
        let inter = false;
        paths.forEach(path => {
          for(let i=0;i<path.length;i++){
            if(car.isHitting(path[i].x, path[i].y, path[(i + 1) % path.length].x, path[(i + 1) % path.length].y)){
              inter = true
            }
          }
        });
        if(inter){
          car.dead();
        }
      }
    }
  });
}

function displaySimulation(){
  background(220);
  cars.forEach(car => {
    car.displayCar(paths);
    if(showVision)
      car.displayVision(paths);
  });

  stroke(0);
  paths.forEach(path => {
    for(let i=0;i<path.length;i++){
      line(path[i].x, path[i].y, path[(i + 1) % path.length].x, path[(i + 1) % path.length].y);
    }
  });
  for(let i=0;i<newPath.length;i++){
    line(newPath[i].x, newPath[i].y, newPath[(i + 1) % newPath.length].x, newPath[(i + 1) % newPath.length].y);
  }

  text("Generation " + neat.generation, 10, 20);
  text("Simulation speed " + simulationSpeed, 10, 35);
  text("Max score " + maxScore(), 10, 50);
}

function draw() {
  if(showSimulation) {
    if(!pause){
      for(let i=0;i<simulationSpeed;i++){
        updateSimulation();
      }
    }

    displaySimulation();
  } else {
    for(let i=0;i<1000;i++){
      updateSimulation();
    }
  }
}

function mousePressed(){
  if(mouseButton == LEFT){
    newPath.push({x: mouseX, y: mouseY});
  } else if(mouseButton == RIGHT){
    newPath.push({x: mouseX, y: mouseY});
    paths.push(newPath);
    newPath = [];
  }
}

function keyPressed() {
  if (keyCode == UP_ARROW){
    up = true;
    simulationSpeed += 1;
  }
  if (keyCode == DOWN_ARROW){
    if(simulationSpeed > 1)
      simulationSpeed -= 1;
  }
  if (keyCode == LEFT_ARROW)
    left = true;
  if (keyCode == RIGHT_ARROW)
    right = true;
  
  if(key == 'p'){
    pause = !pause;
  }
  if(keyCode == ENTER) {
    initNeat();
    startEvaluation();
    pause = false;
  }
  console.log(key);
  if(key == 'e') {
    paths.push(newPath);
    newPath = [];
  }
  if(key == 'n') {
    endEvaluation();
    pause = false;
  }
  if(key == 'd') {
    paths = [];
  }
  if(key == 'v') {
    showVision = !showVision;
  }
  if(key == 'h') {
    showSimulation = !showSimulation;
  }
}

function keyReleased() {
  if (keyCode == UP_ARROW)
    up = false;
  if (keyCode == LEFT_ARROW)
    left = false;
  if (keyCode == RIGHT_ARROW)
    right = false;
}