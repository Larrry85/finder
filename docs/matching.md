### Breakdown of Match Percentage Calculation

1. **Shared Interests (40%)**:
   - This factor calculates the percentage of shared interests, Golang projects, and JavaScript projects between the user and the buddy.
   - Function: `calculateSharedInterests`

2. **Location Matching (30%)**:
   - This factor checks if the location city is same.
   - Function: `calculateLocationMatching`

3. **Age Compatibility (20%)**:
   - This factor calculates if the age difference under 10.
   - Function: `calculateAgeCompatibility`

4. **Profile Completeness (10%)**:
   - This factor calculates the completeness of the buddy's profile based on the number of filled fields.
   - Function: `calculateProfileCompleteness`

### Filtering Recommendations

Everyone under 30% is excluded from recommendations.

```
[0] 2025/01/21 23:48:41 Final recommendations: 10
[0] 2025/01/21 23:48:41 Final recommendation IDs: [742 932 25 136 716 428 1041 1428 335 700]
[0] 2025/01/21 23:48:41 recommendations after sorting: 2001
[0] 2025/01/21 23:48:41 recommendations after 30percent: 89
[0] 2025/01/21 23:48:41 Best Recommendations 1: ID: 742 - Match Percentage: 70%
[0] 2025/01/21 23:48:41 Best Recommendations 2: ID: 932 - Match Percentage: 64%
[0] 2025/01/21 23:48:41 Best Recommendations 3: ID: 25 - Match Percentage: 64%
[0] 2025/01/21 23:48:41 Best Recommendations 4: ID: 136 - Match Percentage: 60%
[0] 2025/01/21 23:48:41 Best Recommendations 5: ID: 716 - Match Percentage: 58%
[0] 2025/01/21 23:48:41 Best Recommendations 6: ID: 428 - Match Percentage: 54%
[0] 2025/01/21 23:48:41 Best Recommendations 7: ID: 1041 - Match Percentage: 50%
[0] 2025/01/21 23:48:41 Best Recommendations 8: ID: 1428 - Match Percentage: 50%
[0] 2025/01/21 23:48:41 Best Recommendations 9: ID: 335 - Match Percentage: 50%
[0] 2025/01/21 23:48:41 Best Recommendations 10: ID: 700 - Match Percentage: 50%
```

### Examples

#### Same City:
```
[0] 2025/01/21 23:43:58 Shared Interests: []
[0] 2025/01/21 23:43:58 Shared Projects: [{Name:itinerary-prettifier}]
[0] 2025/01/21 23:43:58 Shared Projects: []
[0] 2025/01/21 23:43:58 User Interests: [HTML5]
[0] 2025/01/21 23:43:58 Buddy Interests: [MySQL DevOps Design Patterns SQLite Cloud Architecture]
[0] 2025/01/21 23:43:58 Shared Interests: []
[0] 2025/01/21 23:43:58 User Golang Projects: [{Name:itinerary/itinerary-prettifier} {Name:stations/stations-pathfinder} {Name:cars/cars-viewer} {Name:art/art-interface} {Name:art/art-decoder} {Name:literary-lions/literary-lions-forum}]
[0] 2025/01/21 23:43:58 Buddy Golang Projects: [{Name:itinerary-prettifier}]
[0] 2025/01/21 23:43:58 Shared Golang Projects: [{Name:itinerary-prettifier}]
[0] 2025/01/21 23:43:58 User Javascript Projects: [{Name:hellojs/hello-world}]
[0] 2025/01/21 23:43:58 Buddy Javascript Projects: [{Name:frontend-framework} {Name:frontend-framework}]
[0] 2025/01/21 23:43:58 Shared Javascript Projects: []
[0] 2025/01/21 23:43:58 Total Shared: 1, Total Possible: 8
[0] 2025/01/21 23:43:58 User Location City: Espoo, Buddy Location City: Espoo
[0] 2025/01/21 23:43:58 AgeDifference: 12
[0] 2025/01/21 23:43:58 Shared Interests: 12.50%
[0] 2025/01/21 23:43:58 Location Matching: 100.00%
[0] 2025/01/21 23:43:58 Age Compatibility: 0.00%
[0] 2025/01/21 23:43:58 Profile Completeness: 100.00%
```

#### Same Project:
```
[0] 2025/01/21 23:20:57 Shared Interests: []
[0] 2025/01/21 23:20:57 Shared Projects: [{Name:itinerary-prettifier}]
[0] 2025/01/21 23:20:57 Shared Projects: []
[0] 2025/01/21 23:20:57 User Interests: [CSS]
[0] 2025/01/21 23:20:57 Buddy Interests: [Natural Language Processing GraphQL]
[0] 2025/01/21 23:20:57 Shared Interests: []
[0] 2025/01/21 23:20:57 User Golang Projects: [{Name:itinerary/itinerary-prettifier}]
[0] 2025/01/21 23:20:57 Buddy Golang Projects: [{Name:literary-lions-forum} {Name:literary-lions-forum} {Name:itinerary-prettifier}]
[0] 2025/01/21 23:20:57 Shared Golang Projects: [{Name:itinerary-prettifier}]
[0] 2025/01/21 23:20:57 User Javascript Projects: []
[0] 2025/01/21 23:20:57 Buddy Javascript Projects: [{Name:multi-player}]
[0] 2025/01/21 23:20:57 Shared Javascript Projects: []
[0] 2025/01/21 23:20:57 Total Shared: 1, Total Possible: 2
[0] 2025/01/21 23:20:57 User Location City: Helsinki, Buddy Location City: Varkaus
[0] 2025/01/21 23:20:57 AgeDifference: 86
[0] 2025/01/21 23:20:57 Shared Interests: 50.00%
[0] 2025/01/21 23:20:57 Location Matching: 0.00%
[0] 2025/01/21 23:20:57 Age Compatibility: 0.00%
[0] 2025/01/21 23:20:57 Profile Completeness: 100.00%
```

#### Two Same Projects:
```
[0] 2025/01/21 23:28:22 Shared Interests: []
[0] 2025/01/21 23:28:22 Shared Projects: [{Name:itinerary-prettifier}]
[0] 2025/01/21 23:28:22 Shared Projects: [{Name:multi-player}]
[0] 2025/01/21 23:28:22 User Interests: [HTML5 Python Docker]
[0] 2025/01/21 23:28:22 Buddy Interests: [Natural Language Processing GraphQL]
[0] 2025/01/21 23:28:22 Shared Interests: []
[0] 2025/01/21 23:28:22 User Golang Projects: [{Name:itinerary/itinerary-prettifier}]
[0] 2025/01/21 23:28:22 Buddy Golang Projects: [{Name:literary-lions-forum} {Name:literary-lions-forum} {Name:itinerary-prettifier}]
[0] 2025/01/21 23:28:22 Shared Golang Projects: [{Name:itinerary-prettifier}]
[0] 2025/01/21 23:28:22 User Javascript Projects: [{Name:web-game/multi-player}]
[0] 2025/01/21 23:28:22 Buddy Javascript Projects: [{Name:multi-player}]
[0] 2025/01/21 23:28:22 Shared Javascript Projects: [{Name:multi-player}]
[0] 2025/01/21 23:28:22 Total Shared: 2, Total Possible: 5
[0] 2025/01/21 23:28:22 User Location City: Helsinki, Buddy Location City: Varkaus
[0] 2025/01/21 23:28:22 AgeDifference: 86
[0] 2025/01/21 23:28:22 Shared Interests: 40.00%
[0] 2025/01/21 23:28:22 Location Matching: 0.00%
[0] 2025/01/21 23:28:22 Age Compatibility: 0.00%
[0] 2025/01/21 23:28:22 Profile Completeness: 100.00%
```

#### Three Same Projects:
```
[0] 2025/01/21 23:37:50 Shared Interests: []
[0] 2025/01/21 23:37:50 Shared Projects: [{Name:stations-pathfinder} {Name:art-interface} {Name:art-interface}]
[0] 2025/01/21 23:37:50 Shared Projects: []
[0] 2025/01/21 23:37:50 User Interests: [HTML5]
[0] 2025/01/21 23:37:50 Buddy Interests: [OpenGL Bootstrap AWS]
[0] 2025/01/21 23:37:50 Shared Interests: []
[0] 2025/01/21 23:37:50 User Golang Projects: [{Name:itinerary/itinerary-prettifier} {Name:stations/stations-pathfinder} {Name:cars/cars-viewer} {Name:art/art-interface} {Name:art/art-decoder}]
[0] 2025/01/21 23:37:50 Buddy Golang Projects: [{Name:stations-pathfinder} {Name:art-interface} {Name:art-interface}]
[0] 2025/01/21 23:37:50 Shared Golang Projects: [{Name:stations-pathfinder} {Name:art-interface} {Name:art-interface}]
[0] 2025/01/21 23:37:50 User Javascript Projects: [{Name:hellojs/hello-world}]
[0] 2025/01/21 23:37:50 Buddy Javascript Projects: [{Name:got-the-time}]
[0] 2025/01/21 23:37:50 Shared Javascript Projects: []
[0] 2025/01/21 23:37:50 Total Shared: 3, Total Possible: 7
[0] 2025/01/21 23:37:50 User Location City: Helsinki, Buddy Location City: Kokkola
[0] 2025/01/21 23:37:50 AgeDifference: 38
[0] 2025/01/21 23:37:50 Shared Interests: 42.86%
[0] 2025/01/21 23:37:50 Location Matching: 0.00%
[0] 2025/01/21 23:37:50 Age Compatibility: 0.00%
[0] 2025/01/21 23:37:50 Profile Completeness: 100.00%
```

#### Same Interest:
```
[0] 2025/01/21 23:26:41 Shared Interests: [Python]
[0] 2025/01/21 23:26:41 Shared Projects: []
[0] 2025/01/21 23:26:41 Shared Projects: []
[0] 2025/01/21 23:26:41 User Interests: [HTML5 Python Docker]
[0] 2025/01/21 23:26:41 Buddy Interests: [Python SwiftUI Laravel Design Patterns]
[0] 2025/01/21 23:26:41 Shared Interests: [Python]
[0] 2025/01/21 23:26:41 User Golang Projects: [{Name:itinerary/itinerary-prettifier}]
[0] 2025/01/21 23:26:41 Buddy Golang Projects: [{Name:literary-lions-forum} {Name:art-interface}]
[0] 2025/01/21 23:26:41 Shared Golang Projects: []
[0] 2025/01/21 23:26:41 User Javascript Projects: []
[0] 2025/01/21 23:26:41 Buddy Javascript Projects: [{Name:web} {Name:grow-and-shrink}]
[0] 2025/01/21 23:26:41 Shared Javascript Projects: []
[0] 2025/01/21 23:26:41 Total Shared: 1, Total Possible: 4
[0] 2025/01/21 23:26:41 User Location City: Helsinki, Buddy Location City: Parainen
[0] 2025/01/21 23:26:41 AgeDifference: 48
[0] 2025/01/21 23:26:41 Shared Interests: 25.00%
[0] 2025/01/21 23:26:41 Location Matching: 0.00%
[0] 2025/01/21 23:26:41 Age Compatibility: 0.00%
[0] 2025/01/21 23:26:41 Profile Completeness: 100.00%
```

#### Same Interest and Project:
```
[0] 2025/01/21 23:33:34 Shared Interests: [React]
[0] 2025/01/21 23:33:34 Shared Projects: [{Name:art-interface} {Name:stations-pathfinder}]
[0] 2025/01/21 23:33:34 Shared Projects: []
[0] 2025/01/21 23:33:34 User Interests: [HTML5 Python Docker Vue.js Java React]
[0] 2025/01/21 23:33:34 Buddy Interests: [Bootstrap Scrum SwiftUI IoT React]
[0] 2025/01/21 23:33:34 Shared Interests: [React]
[0] 2025/01/21 23:33:34 User Golang Projects: [{Name:itinerary/itinerary-prettifier} {Name:stations/stations-pathfinder} {Name:cars/cars-viewer} {Name:art/art-interface} {Name:art/art-decoder}]
[0] 2025/01/21 23:33:34 Buddy Golang Projects: [{Name:art-interface} {Name:stations-pathfinder} {Name:literary-lions-forum}]
[0] 2025/01/21 23:33:34 Shared Golang Projects: [{Name:art-interface} {Name:stations-pathfinder}]
[0] 2025/01/21 23:33:34 User Javascript Projects: [{Name:web-game/multi-player} {Name:matchme/web} {Name:browserjs/toggle-class} {Name:realjs/ancient-history} {Name:hellojs/hello-world}]
[0] 2025/01/21 23:33:34 Buddy Javascript Projects: [{Name:array-map}]
[0] 2025/01/21 23:33:34 Shared Javascript Projects: []
[0] 2025/01/21 23:33:34 Total Shared: 3, Total Possible: 16
[0] 2025/01/21 23:33:34 User Location City: Helsinki, Buddy Location City: Eura
[0] 2025/01/21 23:33:34 AgeDifference: 89
[0] 2025/01/21 23:33:34 Shared Interests: 18.75%
[0] 2025/01/21 23:33:34 Location Matching: 0.00%
[0] 2025/01/21 23:33:34 Age Compatibility: 0.00%
[0] 2025/01/21 23:33:34 Profile Completeness: 100.00%
```

#### No Same Things:
```
[0] 2025/01/21 23:33:34 Shared Interests: []
[0] 2025/01/21 23:33:34 Shared Projects: []
[0] 2025/01/21 23:33:34 Shared Projects: []
[0] 2025/01/21 23:33:34 User Interests: [HTML5 Python Docker Vue.js Java React]
[0] 2025/01/21 23:33:34 Buddy Interests: [Prometheus IoT]
[0] 2025/01/21 23:33:34 Shared Interests: []
[0] 2025/01/21 23:33:34 User Golang Projects: [{Name:itinerary/itinerary-prettifier} {Name:stations/stations-pathfinder} {Name:cars/cars-viewer} {Name:art/art-interface} {Name:art/art-decoder}]
[0] 2025/01/21 23:33:34 Buddy Golang Projects: [{Name:literary-lions-forum}]
[0] 2025/01/21 23:33:34 Shared Golang Projects: []
[0] 2025/01/21 23:33:34 User Javascript Projects: [{Name:web-game/multi-player} {Name:matchme/web} {Name:browserjs/toggle-class} {Name:realjs/ancient-history} {Name:hellojs/hello-world}]
[0] 2025/01/21 23:33:34 Buddy Javascript Projects: [{Name:frontend-framework} {Name:npc} {Name:escape}]
[0] 2025/01/21 23:33:34 Shared Javascript Projects: []
[0] 2025/01/21 23:33:34 Total Shared: 0, Total Possible: 16
[0] 2025/01/21 23:33:34 User Location City: Helsinki, Buddy Location City: Porvoo
[0] 2025/01/21 23:33:34 AgeDifference: 88
[0] 2025/01/21 23:33:34 Shared Interests: 0.00%
[0] 2025/01/21 23:33:34 Location Matching: 0.00%
[0] 2025/01/21 23:33:34 Age Compatibility: 0.00%
[0] 2025/01/21 23:33:34 Profile Completeness: 100.00%
```

#### Age:
```
[0] 2025/01/21 23:20:57 Shared Interests: []
[0] 2025/01/21 23:20:57 Shared Projects: []
[0] 2025/01/21 23:20:57 Shared Projects: []
[0] 2025/01/21 23:20:57 User Interests: [CSS]
[0] 2025/01/21 23:20:57 Buddy Interests: [GitHub Actions Computer Vision Azure]
[0] 2025/01/21 23:20:57 Shared Interests: []
[0] 2025/01/21 23:20:57 User Golang Projects: [{Name:itinerary/itinerary-prettifier}]
[0] 2025/01/21 23:20:57 Buddy Golang Projects: [{Name:literary-lions-forum} {Name:art-decoder}]
[0] 2025/01/21 23:20:57 Shared Golang Projects: []
[0] 2025/01/21 23:20:57 User Javascript Projects: []
[0] 2025/01/21 23:20:57 Buddy Javascript Projects: [{Name:multi-player} {Name:array}]
[0] 2025/01/21 23:20:57 Shared Javascript Projects: []
[0] 2025/01/21 23:20:57 Total Shared: 0, Total Possible: 2
[0] 2025/01/21 23:20:57 User Location City: Helsinki, Buddy Location City: Keminmaa
[0] 2025/01/21 23:20:57 AgeDifference: 2
[0] 2025/01/21 23:20:57 Shared Interests: 0.00%
[0] 2025/01/21 23:20:57 Location Matching: 0.00%
[0] 2025/01/21 23:20:57 Age Compatibility: 80.00%
[0] 2025/01/21 23:20:57 Profile Completeness: 100.00%
```
