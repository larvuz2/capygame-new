# Character Animations

Place your character animation files here with the following names:
- `idle.glb` - Animation for when the character is standing still
- `walk.glb` - Animation for when the character is moving
- `jump.glb` - Animation for when the character is in the air (jumping or falling)

## Requirements

- Animations should be in GLB format
- Animations should be compatible with the character model's skeleton
- Each animation should be in its own file
- Animations should be loopable (except for jump, which can be a single cycle)

## Notes

The system will automatically switch between animations based on the character's state:
- Idle when the character is not moving
- Walk when the character is moving
- Jump when the character is in the air