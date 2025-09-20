# BW-DEST-GROUP7

VR Escape Room - Sustainability-focused educational experience

## Room Structure

### Main Flow
- **Entrance**: Welcome area with instructions and START button
- **Main Room**: Integrated puzzle combining all prototypes (CO₂ material sorting with scanner)
- **End Room**: Celebration and navigation to individual prototypes

### Individual Prototype Rooms
- **Room 1**: Key Finding Prototype
- **Room 2**: Material Display Prototype
- **Room 3**: Wood Pickup Prototype
- **Room 4**: Scanner System Prototype
- **Room 5**: Material Sorting Prototype (with locked backdoor)
- **Room 6**: Wall Cutting/Saw Prototype

All individual rooms are now isolated (doors replaced with walls) and accessible only through the End Room navigation.

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
├── room1-puzzles      # Room 1 development & iteration (Key Finding)
├── room2-puzzles      # Room 2 development & iteration (Material Display)
├── room3-puzzles      # Room 3 development & iteration (Wood Pickup)
├── room4-puzzles      # Room 4 development & iteration (Scanner System)
├── room5-puzzles      # Room 5 development & iteration (Material Sorting)
├── room6-puzzles      # Room 6 development & iteration (Wall Cutting/Saw)
├── main-integration   # Main room combining all prototypes
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

# Push room branch and tags
git push origin room1-puzzles --tags
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
