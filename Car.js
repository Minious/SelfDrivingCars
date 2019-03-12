function Car(x, y, brain) {
  this.pos = {
    x: x,
    y: y
  };
  this.angle = 0;
  this.width = 10;
  this.height = 15;

  this.elapsedDistance = 0;
  
  this.brain = brain;

  //console.log(brain);

  this.isDead = false;

  this.startTime = millis();

  this.color = {
    r: 255,
    g: 255,
    b: 255
  };

  this.move = function(acc, dir) {
    if(!this.isDead){
      this.pos.x += acc * Math.cos(this.angle) * Car.speed;
      this.pos.y += acc * Math.sin(this.angle) * Car.speed;
      this.angle += dir * acc * Car.turnPower;
      
      this.elapsedDistance += acc;
    }
  };

  this.dead = function(){
    this.color = {r: 255, g: 0, b: 0};
    this.isDead = true;
    this.brain.score = this.getScore();
  }

  this.getScore = function(){
    let elapsedTime = millis() - this.startTime;
    return this.elapsedDistance// / (1 + elapsedTime / 1000);
  }

  this.displayCar = function(paths) {
    push();
    stroke(0);
    fill(this.color.r, this.color.g, this.color.b);
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    rectMode(CENTER);
    rect(0, 0, this.height, this.width);
    pop();
  };

  this.displayVision = function(paths) {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    let visionValues = this.getVisionValues(paths);
    let c = 0;
    for (let i = -Math.PI / 2; i <= Math.PI / 2; i += Math.PI / Car.nbVisions) {
      let intersect = !!visionValues[c];
      rotate(i);
      if (intersect) {
        stroke(255, 0, 0);
      } else {
        stroke(0);
      }
      strokeWeight(1);
      line(0, 0, Car.visionLength, 0);
      if (intersect) {
        strokeWeight(4);
        point(visionValues[c] * Car.visionLength, 0);
      }
      rotate(-i);
      c += 1;
    }
    pop();
  };

  this.getVisionValues = function(paths){
    let visionValues = [];
    for (let i = -Math.PI / 2; i <= Math.PI / 2; i += Math.PI / Car.nbVisions) {
      let curDist;
      let x0 = this.pos.x;
      let y0 = this.pos.y;
      let x1 = this.pos.x + Math.cos(this.angle + i) * Car.visionLength;
      let y1 = this.pos.y + Math.sin(this.angle + i) * Car.visionLength;
      paths.forEach(path => {
        for (let j = 0; j < path.length; j++) {
          if (isHitting(x0, y0, x1, y1, path[j].x, path[j].y, path[(j + 1) % path.length].x, path[(j + 1) % path.length].y)) {
            intersectionPos = checkLineIntersection(x0, y0, x1, y1, path[j].x, path[j].y, path[(j + 1) % path.length].x, path[(j + 1) % path.length].y);
          	let tempDist = distance(intersectionPos.x, intersectionPos. y, this.pos.x, this.pos.y)
          	if(!curDist || tempDist < curDist){
              curDist = tempDist;
          	}
          }
        }
      });
      visionValues.push(curDist / Car.visionLength);
    }
    return visionValues;
  }

  this.isHitting = function(x1, y1, x2, y2) {
    let cornerAngle = Math.atan(this.width / this.height);
    let cornerHyp = Math.sqrt(this.width * this.width / 4 + this.height * this.height / 4)
    let x3 = this.pos.x + Math.cos(this.angle + cornerAngle) * cornerHyp;
    let y3 = this.pos.y + Math.sin(this.angle + cornerAngle) * cornerHyp;
    let x4 = this.pos.x + Math.cos(this.angle - cornerAngle + Math.PI) * cornerHyp;
    let y4 = this.pos.y + Math.sin(this.angle - cornerAngle + Math.PI) * cornerHyp;
    let x5 = this.pos.x + Math.cos(this.angle + cornerAngle + Math.PI) * cornerHyp;
    let y5 = this.pos.y + Math.sin(this.angle + cornerAngle + Math.PI) * cornerHyp;
    let x6 = this.pos.x + Math.cos(this.angle - cornerAngle) * cornerHyp;
    let y6 = this.pos.y + Math.sin(this.angle - cornerAngle) * cornerHyp;

    return isHitting(x1, y1, x2, y2, x3, y3, x4, y4) ||
      isHitting(x1, y1, x2, y2, x4, y4, x5, y5) ||
      isHitting(x1, y1, x2, y2, x5, y5, x6, y6) ||
      isHitting(x1, y1, x2, y2, x6, y6, x3, y3);
  };
}

Car.nbVisions = 10;
Car.minSpeed = 0.5;
Car.visionLength = 60;
Car.turnPower = 0.07;
Car.speed = 2.5;
