# BW-DEST-GROUP7

VR Escape Room

## Development

### Local Development
Run the application locally with HTTP:
```bash
docker compose -f docker-compose.local.yml up --build
```

Access at: http://localhost

### Production
Run the application in production with HTTPS:
```bash
docker compose up --build
```

Access at: https://openly-escape-room.ch

## Prototype Development Workflow

This project uses a Git branching strategy optimized for design thinking and iterative prototype development.

### Branch Structure
```
main                    # Stable integrated versions
├── room1-puzzles      # Room 1 development & iteration
├── room2-puzzles      # Room 2 development & iteration  
├── room3-puzzles      # Room 3 development & iteration
├── room4-puzzles      # Room 4 development & iteration
└── entrance-system    # Entrance/navigation improvements
```

### Development Workflow

#### 1. Starting a New Room/Feature
```bash
# Create and switch to room branch
git checkout -b room1-puzzles

# Develop your room/feature
# ... make changes ...

# Commit and tag your first prototype
git add .
git commit -m "Add key-finding puzzle mechanism"
git tag room1-v1.0-prototype
```

#### 2. Iterating on a Room
```bash
# Continue developing on the room branch
git checkout room1-puzzles

# Make improvements
# ... iterate on puzzles ...

# Save iteration
git add .
git commit -m "Improve key visibility and add hints"
git tag room1-v1.1-prototype

# Continue iterating...
git commit -m "Add sound effects and polish"
git tag room1-v2.0-prototype
```

#### 3. Integrating Completed Rooms
```bash
# Switch to main branch
git checkout main

# Merge completed room
git merge room1-puzzles

# Tag the integrated version
git tag v1.0-prototype "Complete game with Room 1"

# Push everything
git push origin main --tags
```

### Useful Commands

#### Compare Prototype Versions
```bash
# Compare different iterations of a room
git diff room1-v1.0-prototype room1-v2.0-prototype

# Compare integrated versions
git diff v1.0-prototype v2.0-prototype
```

#### Rollback to Previous Version
```bash
# Go back to a specific room version
git checkout room1-v1.0-prototype

# Go back to a specific integrated version
git checkout v1.0-prototype
```

#### View All Prototype Versions
```bash
# List all tags
git tag --list

# List tags with dates
git tag --list --sort=-creatordate --format='%(refname:short) (%(creatordate:short))'
```

### Benefits of This Approach
- **Isolated Development**: Each room can be developed independently
- **Easy Comparison**: Compare different iterations of the same room
- **Parallel Development**: Multiple people can work on different rooms
- **Design Documentation**: Git commits serve as design decision log
