import { useWindowDimensions, View } from "react-native";
import {
  Skia,
  Canvas,
  Shader,
  Fill,
  SkRuntimeEffect,
  vec,
} from "@shopify/react-native-skia";
import {
  Easing,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import { useEffect, useRef, useState } from "react";
import { useFlickerFreeClock } from "~/hooks/flickerFreeClock";
import { Text } from "~/components/ui/text";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const source = Skia.RuntimeEffect.Make(`
  uniform float2 u_circle_pos;
  uniform float u_circle_radius;
  uniform float u_clock;
  uniform float u_canvas_width;
  uniform float u_num_dots;
  uniform float u_max_brightness;
  uniform vec4 u_color;
  uniform vec4 u_bg_color;

  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  vec4 main(vec2 pos) {
    // --- Setup ---
    // Ensure num_dots is a positive number to prevent division by zero.
    float num_dots = u_num_dots > 0.0 ? u_num_dots : 50.0;

    // Get the center postion of the current dot based on the position and the number of dots.
    float pitch = u_canvas_width / num_dots;
    vec2 dot_center = floor(pos / pitch) * pitch + vec2(pitch / 2.0);

    // Calculate the distance from the center of the dot to the circle position.
    float dist_to_circle = length(dot_center - u_circle_pos);

    // Calculate the brightness based on the distance to the circle position.
    float brightness = smoothstep(u_circle_radius, u_circle_radius * 0.5, dist_to_circle) * u_max_brightness;

    // --- Size and Shape Calculation ---
    vec2 p = pos - dot_center;
    // The dot's base size is now the pitch.
    float half_size = brightness * pitch / 2.0;

    float dot_dist = sdCircle(p, half_size);

    // --- Final Color Drawing ---
    vec4 dot_color = vec4(brightness * u_color.rgb, 1.0);
    float alpha = 1.0 - smoothstep(-1.0, 1.0, dot_dist);
    return mix(u_bg_color, dot_color, alpha);
  }
`);

const COLOR: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];
const BACKGROUND_COLOR: [number, number, number, number] = [0.0, 0.0, 0.0, 1.0];
const SPEED = 0.0005;

export default function Screen() {
  const { width, height } = useWindowDimensions();

  const clock = useFlickerFreeClock(
    useDerivedValue(() => SPEED),
    useDerivedValue(() => false),
  );

  const radius = (Math.min(width, height) * 1) / 20;

  const circleDesiredPos = useDerivedValue(() => {
    const t = (clock.value * 2) % 1; // Normalize to 0-1

    const bezierT = Easing.bezier(0.455, 0.03, 0.515, 0.955).factory()(t);

    const angle = bezierT * 2 * Math.PI - Math.PI / 2; // Convert to radians and offset by PI/2

    const desiredCircleX = width / 2 + Math.cos(angle) * (width / 3 - radius);
    const desiredCircleY = height / 2 + Math.sin(angle) * (width / 3 - radius);

    return vec(desiredCircleX, desiredCircleY);
  });

  const circlePos = useSharedValue(vec(width / 2, height / 2));

  const pointer = useSharedValue(vec(-1, -1));

  const uniforms = useDerivedValue(() => {
    const pointerActive = pointer.value.x >= 0 && pointer.value.y >= 0;

    const desiredPos = pointerActive ? pointer.value : circleDesiredPos.value;
    const currentPos = circlePos.value;

    const dx = desiredPos.x - currentPos.x;
    const dy = desiredPos.y - currentPos.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    circlePos.value = vec(
      currentPos.x + normalizedDx * 0.1 * distance,
      currentPos.y + normalizedDy * 0.1 * distance,
    );

    return {
      u_circle_pos: circlePos.value,
      u_clock: clock.value,
      u_circle_radius: radius,
      u_canvas_width: width,
      u_num_dots: 50, // Number of dots to fit across the canvas width
      u_max_brightness: 1.0, // Maximum brightness of the dots
      u_color: COLOR,
      u_bg_color: BACKGROUND_COLOR, // Background color
    };
  });

  const gesture = Gesture.Pan()
    .onBegin((event) => {
      // Set the pointer position to the initial touch point
      pointer.value = vec(event.x, event.y);
    })
    .onUpdate((event) => {
      pointer.value = vec(event.x, event.y);
    })
    .onFinalize(() => {
      // Reset the pointer position when the gesture ends
      pointer.value = vec(-1, -1);
    });

  return (
    <View className="flex-1 items-center justify-center gap-5 bg-secondary/30">
      <GestureDetector gesture={gesture}>
        <Canvas style={{ flex: 1, width, height }}>
          <Fill>
            <Shader source={source as SkRuntimeEffect} uniforms={uniforms} />
          </Fill>
        </Canvas>
      </GestureDetector>
    </View>
  );
}
