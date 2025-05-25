#include <Servo.h>

Servo myServo;

const int buttonPin = 2;     // Button to control servo
const int irSensorPin = 4;   // IR sensor pin
const int ledPin = 5;        // LED connected to PWM pin

int currentAngle = 0;

void setup() {
  myServo.attach(9);                 // Servo on pin 9
  pinMode(buttonPin, INPUT);
  pinMode(irSensorPin, INPUT);
  pinMode(ledPin, OUTPUT);
  myServo.write(currentAngle);      // Initial position
}

void loop() {
  // Servo control with button
  if (digitalRead(buttonPin) && currentAngle < 90) {
    currentAngle++;
    myServo.write(currentAngle);
    delay(15);
  } 
  else if (!digitalRead(buttonPin) && currentAngle > 0) {
    currentAngle--;
    myServo.write(currentAngle);
    delay(15);
  }

  // IR sensor control for LED
  if (digitalRead(irSensorPin)) {
  
    analogWrite(ledPin, 0);
  } else {
      analogWrite(ledPin,255);
    delay(1000);
    analogWrite(ledPin,191);
    delay(1000);
    analogWrite(ledPin,127);
    delay(1000); // 75% brightness
    analogWrite(ledPin, 0);   // Turn off
  }
}
