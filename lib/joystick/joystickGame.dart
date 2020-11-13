import 'package:flame/flame.dart';
import "package:flame/game.dart";
import 'package:flutter/material.dart';
import 'package:gameOff2020/joystick/trigger.dart';

import 'bullet.dart';
import 'world.dart';
import 'enemy.dart';
import 'debris.dart';
import 'planet.dart';
import 'server.dart';
import 'joystick.dart';
import 'spaceship.dart';
import "touchData.dart";

class JoystickGame extends Game {
  // Instance Variable
  Size screenSize;
  double tileSize;

  Server server;
  Trigger trigger;
  Joystick joystick;
  Spaceship spaceship;

  List<TouchData> taps = [];

  JoystickGame() {
    initialize();
  }

  void initialize() async {
    // Wait for Flame to get final screen dimensions before passing it on to components
    resize(await Flame.util.initialDimensions());

    // Initialize Components
    server = Server();

    server.world = World(game: this);
    server.planets.add(Planet(game: this));
    server.spaceships.add(Enemy(game: this));

    for (var i = 0; i < 250; i++) {
      server.debris.add(Debris(game: this));
    }

    trigger = Trigger(game: this);
    joystick = Joystick(game: this);
    spaceship = Spaceship(game: this);
  }

  @override
  void update(double t) {
    // Sync Components' update method with Game's
    server.update(t);
    spaceship.update(t);
    trigger.update(t);
    joystick.update(t);
  }

  @override
  void render(Canvas canvas) {
    // Sync Components' render method with Game's
    server.render(canvas);
    spaceship.render(canvas);
    trigger.render(canvas);
    joystick.render(canvas);
  }

  @override
  void resize(Size size) {
    // Update Screen size based on device and orientation
    screenSize = size;

    // Get Tile Size to maintain uniform component size on all devices
    tileSize = screenSize.height / 9; // 16:9
  }

  // Sync Gestures with Components' Gesture methods
  void onTap(TouchData touch) {
    taps.add(touch);

    if (joystick.baseRect.contains(touch.offset)) joystick.onTap(touch);

    if (trigger.rect.contains(touch.offset)) {
      Bullet bullet = Bullet(
        game: this,
        angle: spaceship.lastMoveRadAngle,
        startPosition: spaceship.rect.center,
      );

      server.bullets.add(bullet);
    }
  }

  void onDrag(TouchData touch) {
    for (int i = 0; i < taps.length; i++) {
      if (taps[i].touchId == touch.touchId) {
        taps[i] = touch;

        break;
      }
    }

    if (touch.touchId == joystick.touchId) joystick.onDrag(touch);
  }

  void onRelease(TouchData touch) {
    taps.removeWhere((tap) => tap.touchId == touch.touchId);

    if (touch.touchId == joystick.touchId) joystick.onRelease();
  }

  void onCancel(TouchData touch) {
    taps.removeWhere((tap) => tap.touchId == touch.touchId);
  }
}