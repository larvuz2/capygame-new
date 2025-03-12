# Character 3D Model Integration

This folder contains the 3D models and animations for the game's character system.

## Folder Structure

```
assets/
├── models/
│   └── character/
│       └── character.glb    # Main character model
└── animations/
    ├── idle.glb            # Idle animation
    ├── walk.glb            # Walking animation
    └── jump.glb            # Jumping animation
```

## Model Requirements

The character model should be provided in GLB format. The model should be rigged with a skeleton compatible with the animations.

## Animation Requirements

Each animation is stored in its own GLB file. The animations should be compatible with the character model's skeleton.

## Usage

1. Place your character model GLB file in the `assets/models/character/` directory as `character.glb`.
2. Place your animation GLB files in the `assets/animations/` directory with the following names:
   - `idle.glb` - The animation played when the character is not moving
   - `walk.glb` - The animation played when the character is moving
   - `jump.glb` - The animation played when the character is in the air

The animations will automatically be loaded and played based on the character's state:
- When the character is standing still, the idle animation plays
- When the character is moving, the walk animation plays
- When the character is airborne (jumping or falling), the jump animation plays

## Implementation Details

The character model is attached as a child of the physics capsule collider. The capsule itself is made invisible (transparency set to 0), so only the character model is visible.

The animations are controlled by the `CharacterModel` class, which handles loading the model and animations, and switching between animations based on the character's state.