var table;
var starting_ppm;
var adjust_ppm;

let p;
let userDefinedYear;
let prevUserDefinedYear;
let yearSlider;

function preload() {
  // Load the CSV file
  table = loadTable("CO2_proj.csv", "csv", "header");
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);

  // Create the slider and position it
  yearSlider = createSlider(1959, 2100, 2029);
  yearSlider.position(10, 10);

  // Initialize the userDefinedYear variables
  userDefinedYear = yearSlider.value();
  prevUserDefinedYear = userDefinedYear;

  starting_ppm = getPPMForYear(userDefinedYear);
  console.log("Year:", userDefinedYear, "Starting PPM:", starting_ppm);

  // Exponential formula to adjust ppm
  adjust_ppm = 2 * Math.exp(0.02 * (starting_ppm - 315.98)) + 2;

  // Make a new Pendulum with an origin position and arm length
  p = new Pendulum(createVector(width / 2, 0), height / 2);
}

// Function to get the ppm value for the selected year
function getPPMForYear(year) {
  for (let r = 0; r < table.getRowCount(); r++) {
    let rowYear = table.getNum(r, "Year");
    if (rowYear === year) {
      let ppmValue = table.getNum(r, "ppm");
      return ppmValue;
    }
  }
  // If the year is not found, log an error and return undefined
  console.error("Year", year, "not found in the data.");
  return undefined;
}

function draw() {
  background(51);

  // Read the slider value
  userDefinedYear = yearSlider.value();

  // Check if the year has changed
  if (userDefinedYear !== prevUserDefinedYear) {
    starting_ppm = getPPMForYear(userDefinedYear);
    adjust_ppm = 2 * Math.exp(0.02 * (starting_ppm - 315.98)) + 2;

    // Recreate the pendulum with the new adjust_ppm
    p = new Pendulum(createVector(width / 2, 0), height / 2);

    prevUserDefinedYear = userDefinedYear;
  }

  p.go();

  // Display the current year and starting_ppm
  noStroke(); // Disable stroke for text
  fill(255);
  textSize(16);
  textFont("Arial");
  fill(128); // Medium gray
  text("Year: " + userDefinedYear + "  /  PPM: " + starting_ppm, 10, 50);
}

// Pendulum class
function Pendulum(origin_, r_) {
  // Fill all variables
  this.origin = origin_.copy();
  this.position = createVector();
  this.r = r_;
  this.angle = PI / adjust_ppm;

  this.aVelocity = 0.0;
  this.aAcceleration = 0.0;
  this.damping = 1; // Arbitrary damping
  this.ballr = 48.0; // Arbitrary ball radius

  this.go = function () {
    this.update();
    this.display();
  };

  // Function to update position
  this.update = function () {
    let gravity = 0.4; // Arbitrary constant
    this.aAcceleration = ((-1 * gravity) / this.r) * sin(this.angle); // Calculate acceleration
    this.aVelocity += this.aAcceleration; // Increment velocity
    this.aVelocity *= this.damping; // Apply damping
    this.angle += this.aVelocity; // Increment angle
  };

  this.display = function () {
    // Convert polar to cartesian coordinates
    this.position.set(this.r * sin(this.angle), this.r * cos(this.angle), 0);
    this.position.add(this.origin); // Make position relative to the pendulum's origin

    stroke(255);
    strokeWeight(2);
    // Draw the arm
    line(this.origin.x, this.origin.y, this.position.x, this.position.y);
    ellipseMode(CENTER);
    fill(127);
    // Draw the ball
    ellipse(this.position.x, this.position.y, this.ballr, this.ballr);
  };
}

// // ACCELERANDO

// const width = window.innerWidth;
// const height = window.innerHeight;

// // Rectangle dimensions
// const rectWidth = 10; // Skinny rectangle
// const rectHeight = height * 0.7; // 70% of window height

// // Create the SVG canvas
// const svg = d3
//   .select("body")
//   .append("svg")
//   .attr("width", width)
//   .attr("height", height);

// // Create a group element for the pendulum
// const pendulum = svg
//   .append("g")
//   .attr("transform", `translate(${width / 2}, ${height}) rotate(-45)`);

// // Append the rectangle to the pendulum group
// pendulum
//   .append("rect")
//   .attr("x", -rectWidth / 2)
//   .attr("y", -rectHeight)
//   .attr("width", rectWidth)
//   .attr("height", rectHeight)
//   .attr("fill", "black");

// // Initial swing duration
// let duration = 1000; // in milliseconds

// // Pendulum parameters
// const L = rectHeight; // Length of the pendulum
// const thetaInitial = 45; // Initial maximum angle in degrees
// let thetaMax = thetaInitial; // Current maximum angle
// const thetaMin = -45; // Minimum angle (leftmost point)

// // Calculate initial x-coordinate of the pendulum tip at the maximum angle
// const initialXTip = L * Math.sin((thetaInitial * Math.PI) / 180);

// // Initialize the x-offset (how much the rightmost point has moved towards the center)
// let xOffset = 0;

// // Swing function to animate the pendulum
// function swing() {
//   pendulum
//     .transition()
//     .duration(duration)
//     .attr("transform", `translate(${width / 2}, ${height}) rotate(${thetaMax})`)
//     .ease(d3.easeLinear)
//     .transition()
//     .duration(duration)
//     .attr("transform", `translate(${width / 2}, ${height}) rotate(${thetaMin})`)
//     .ease(d3.easeLinear)
//     .on("end", function () {
//       // Increase xOffset by 1 pixel per second
//       xOffset += 1;

//       // Calculate the new maximum angle based on xOffset
//       const argument = (initialXTip - xOffset) / L;
//       if (argument <= 0) {
//         thetaMax = 0; // Stop swinging when the rightmost point reaches the center
//       } else {
//         thetaMax = (Math.asin(argument) * 180) / Math.PI; // Convert to degrees
//       }

//       // Continue swinging if the maximum angle is greater than zero
//       if (thetaMax > 0) {
//         swing();
//       }
//     });
// }

// // Start the swinging animation
// swing();

// Behind the scenes, we look at the actual date and time of NOW, and change the speed accordingly.
// So, for example, if it's September 12, 2024 now, it swings at 1 second left, 1 second right, etc.
// If it's September 12, 2025, it swings at .9 seconds left, .9 seconds right, etc.
// If it's September 12, 2026, it swings at .8 seconds left, .8 seconds right, etc.
// This will continue until the arm swings so fast it's just a blur.
// By default on the front end users see the arm swinging back and forth according to today's date and time.
// But we'll also provide a slider that enables users to change the year. It goes from 1800 to 2100.
// On the left side we have a label that reads: "Atmospheric Oxygen" and a reading as text.
// On te right side we have a label that reads "Carbon Dioxide" and a reading as text.
// There is also an audio tone (as .mp3) that plays each time the arm swings to the left most point. And a different tone that plays when it swings to the right most point.
