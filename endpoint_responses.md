/////////////////////////////////////////////////////////////////////////////

# GET YOUR TOKEN

```
curl -X POST http://localhost:8080/api/login -H "Content-Type: application/json" -d '{"email": "laura1@gmail.com", "password": "lauran1"}'
```

```
{"message":"Login successful","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxhdXJhMUBnbWFpbC5jb20iLCJ1c2VySWQiOjEsImV4cCI6MTczNTYzODAzMX0.IgJAcQv-Y_daA2X8phl4fdlGSQASE1YdaRfWkitLuBo","userId":1,"isProfileComplete":true}
```

### MYTOKEN

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxhdXJhMUBnbWFpbC5jb20iLCJ1c2VySWQiOjEsImV4cCI6MTczNTYzODAzMX0.IgJAcQv-Y_daA2X8phl4fdlGSQASE1YdaRfWkitLuBo
```

/////////////////////////////////////////////////////////////////////////////

# USING POSTMAN APP (Pretty JSON)

Send an API request: New Request  
GET: http://localhost:8080/api/users/1

Headers  
Key: Authorization  
Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxhdXJhMUBnbWFpbC5jb20iLCJ1c2VySWQiOjEsImV4cCI6MTczNTYzODAzMX0.IgJAcQv-Y_daA2X8phl4fdlGSQASE1YdaRfWkitLuBo

/////////////////////////////////////////////////////////////////////////////

# ENDPOINTS USED IN THIS EXAMPLE

"The users endpoint returns a name and profile link."  
http://localhost:8080/api/users/1  
http://localhost:8080/api/users/bio/1

"The me endpoints correctly shortcuts to the appropriate users endpoint."  
http://localhost:8080/api/me

"The recommendations endpoint only returns a list of ids."  
http://localhost:8080/api/recommendationendpoint  
http://localhost:8080/api/recommendations

"The connections endpoint only returns a list of ids."  
http://localhost:8080/api/connections

The profile endpoint returns "about me" type information.  
http://localhost:8080/api/profile/1  
http://localhost:8080/api/users/profile/1

**Endpoints in our app:**

mux.Handle("/api/profile/", middleware.AuthMiddleware(http.HandlerFunc(handlers.GetProfileHandler(db))))  
mux.Handle("/api/recommendations", middleware.AuthMiddleware(http.HandlerFunc(handlers.RecommendationHandler(db))))

**New RESTful endpoints in main.go, using userHandlers.go:**

mux.Handle("/api/users/", middleware.AuthMiddleware(http.HandlerFunc(handlers.UserHandler(db))))  
mux.Handle("/api/me", middleware.AuthMiddleware(http.HandlerFunc(handlers.MeHandler(db))))  
mux.Handle("/api/recommendationendpoint", middleware.AuthMiddleware(http.HandlerFunc(handlers.Recommendationendpoint(db))))  
mux.Handle("/api/connections", middleware.AuthMiddleware(http.HandlerFunc(handlers.ConnectionsHandler(db))))  
mux.Handle("/api/users/profile/", middleware.AuthMiddleware(http.HandlerFunc(handlers.UserProfileHandler(db))))  
mux.Handle("/api/users/bio/", middleware.AuthMiddleware(http.HandlerFunc(handlers.UserBioHandler(db))))

/////////////////////////////////////////////////////////////////////////////

# EXAMPLES

**/USERS/1**  
The users endpoint returns a name and profile link.

curl -X GET http://localhost:8080/api/users/1 -H "Authorization: Bearer **<MYTOKEN>**"

```
{"id":1,"first_name":"Eka","profilePicture":"1_1.png"}
```

or

```
{
    "id": 1,
    "first_name": "Eka",
    "profilePicture": "1_1.png"
}
```

**/USERS/BIO/1**

curl -X GET http://localhost:8080/api/users/bio/1 -H "Authorization: Bearer **<MYTOKEN>**"

```
{"id":1,"first_name":"Eka","bio":"o"}
```

or

```
{
    "id": 1,
    "first_name": "Eka",
    "bio": "o"
}
```

/////////////////////////////////////////////////////////////////////////////

**/ME**  
The me endpoints correctly shortcuts to the appropriate users endpoint.

curl -X GET http://localhost:8080/api/me -H "Authorization: Bearer **<MYTOKEN>**"

```
{"id":1,"first_name":"Eka","profilePicture":"1_1.png","bio":"o"}
```

or

```
{
    "id": 1,
    "first_name": "Eka",
    "profilePicture": "1_1.png",
    "bio": "o"
}
```

/////////////////////////////////////////////////////////////////////////////

**/RECOMMENDATIONENDPOINT**

curl -X GET http://localhost:8080/api/recommendationendpoint -H "Authorization: Bearer **<MYTOKEN>**"

```
[{"id":1},{"id":3},{"id":2},{"id":4},{"id":5},{"id":6},{"id":7},{"id":8},{"id":9},{"id":10},{"id":11},{"id":12},{"id":13},{"id":14},{"id":15},{"id":16},{"id":17},{"id":18},{"id":19},{"id":20},{"id":21},{"id":22},{"id":23},{"id":24},{"id":25},{"id":26},{"id":27},{"id":28},{"id":29},{"id":30},{"id":31},{"id":32},{"id":33},{"id":34},{"id":35},{"id":36},{"id":56},{"id":37},{"id":38},{"id":39},{"id":40},{"id":41},{"id":42},{"id":43},{"id":44},{"id":45},{"id":46},{"id":47},{"id":48},{"id":49},{"id":50},{"id":51},{"id":52},{"id":53},{"id":54},{"id":55},{"id":57},{"id":58},{"id":59},{"id":60},{"id":61},{"id":62},{"id":63},{"id":64},{"id":65},{"id":66},{"id":67},{"id":68},{"id":69},{"id":70},{"id":71},{"id":72},{"id":73},{"id":74},{"id":75},{"id":76},{"id":77},{"id":78},{"id":79},{"id":80},{"id":81},{"id":82},{"id":83},{"id":84},{"id":85},{"id":86},{"id":87},{"id":88},{"id":89},{"id":90},{"id":91},{"id":92},{"id":93},{"id":94},{"id":95},{"id":96},{"id":97},{"id":98},{"id":99},{"id":100},{"id":101},{"id":102},{"id":103}]

```

or

```
[
    {
        "id": 1
    },
    {
        "id": 3
    },
    {
        "id": 2
    },
    {
        "id": 4
    },
    {
        "id": 5
    },
    {
        "id": 6
    },
    {
        "id": 7
    },
    {
        "id": 8
    },
    {
        "id": 9
    },
    {
        "id": 10
    },
    {
        "id": 11
    },
    {
        "id": 12
    },
    {
        "id": 13
    },
    {
        "id": 14
    },
    {
        "id": 15
    },
    {
        "id": 16
    },
    {
        "id": 17
    },
    {
        "id": 18
    },
    {
        "id": 19
    },
    {
        "id": 20
    },
    {
        "id": 21
    },
    {
        "id": 22
    },
    {
        "id": 23
    },
    {
        "id": 24
    },
    {
        "id": 25
    },
    {
        "id": 26
    },
    {
        "id": 27
    },
    {
        "id": 28
    },
    {
        "id": 29
    },
    {
        "id": 30
    },
    {
        "id": 31
    },
    {
        "id": 32
    },
    {
        "id": 33
    },
    {
        "id": 34
    },
    {
        "id": 35
    },
    {
        "id": 36
    },
    {
        "id": 56
    },
    {
        "id": 37
    },
    {
        "id": 38
    },
    {
        "id": 39
    },
    {
        "id": 40
    },
    {
        "id": 41
    },
    {
        "id": 42
    },
    {
        "id": 43
    },
    {
        "id": 44
    },
    {
        "id": 45
    },
    {
        "id": 46
    },
    {
        "id": 47
    },
    {
        "id": 48
    },
    {
        "id": 49
    },
    {
        "id": 50
    },
    {
        "id": 51
    },
    {
        "id": 52
    },
    {
        "id": 53
    },
    {
        "id": 54
    },
    {
        "id": 55
    },
    {
        "id": 57
    },
    {
        "id": 58
    },
    {
        "id": 59
    },
    {
        "id": 60
    },
    {
        "id": 61
    },
    {
        "id": 62
    },
    {
        "id": 63
    },
    {
        "id": 64
    },
    {
        "id": 65
    },
    {
        "id": 66
    },
    {
        "id": 67
    },
    {
        "id": 68
    },
    {
        "id": 69
    },
    {
        "id": 70
    },
    {
        "id": 71
    },
    {
        "id": 72
    },
    {
        "id": 73
    },
    {
        "id": 74
    },
    {
        "id": 75
    },
    {
        "id": 76
    },
    {
        "id": 77
    },
    {
        "id": 78
    },
    {
        "id": 79
    },
    {
        "id": 80
    },
    {
        "id": 81
    },
    {
        "id": 82
    },
    {
        "id": 83
    },
    {
        "id": 84
    },
    {
        "id": 85
    },
    {
        "id": 86
    },
    {
        "id": 87
    },
    {
        "id": 88
    },
    {
        "id": 89
    },
    {
        "id": 90
    },
    {
        "id": 91
    },
    {
        "id": 92
    },
    {
        "id": 93
    },
    {
        "id": 94
    },
    {
        "id": 95
    },
    {
        "id": 96
    },
    {
        "id": 97
    },
    {
        "id": 98
    },
    {
        "id": 99
    },
    {
        "id": 100
    },
    {
        "id": 101
    },
    {
        "id": 102
    },
    {
        "id": 103
    }
]

```

/////////////////////////////////////////////////////////////////////////////

**/RECOMMENDATIONS**  
The recommendations endpoint only returns a list of ids.

curl -X GET http://localhost:8080/api/recommendations -H "Authorization: Bearer **<MYTOKEN>**"

```
[{"id":"8","name":"Nickolas Kohler","birthDate":"1953-06-23T00:00:00Z","age":44,"gender":"Male","biography":"Professional Lead with a DevOps Engineer background. 6 years of hands-on experience in Next.js. Currently focused on Spring Boot development at a Information Systems.%!(EXTRA string=software house)","locationCity":"Mikkeli","interests":["Next.js","Spring Boot"],"maxDistancePreference":50,"profilePicture":"/uploads/default-profile.jpg"},{"id":"9","name":"Bailey Sporer","birthDate":"1938-09-13T00:00:00Z","age":55,"gender":"Other","biography":"Tech enthusiast and Junior Cloud Architect with 4 years in the industry. Specialized in Redux and TypeScript. Cybersecurity graduate working at a software house.","locationCity":"Oulu","interests":["C++","Redux","TypeScript"],"maxDistancePreference":50,"profilePicture":"/uploads/default-profile.jpg"},{"id":"10","name":"Greta Funk","birthDate":"2013-09-10T00:00:00Z","age":50,"gender":"Unknown","biography":"Senior Full Stack Developer passionate about %!s(int=7) and Ruby. %!d(string=Kotlin) years of experience in the field, studied Computer Science. Working at a software house.","locationCity":"Vaasa","interests":["Spring Boot","ELK Stack","Kotlin","Agile","Ruby"],"maxDistancePreference":50,"profilePicture":"/uploads/default-profile.jpg"},{"id":"11","name":"Quinten Wuckert","birthDate":"1953-12-01T00:00:00Z","age":47,"gender":"Unknown","biography":"Lead Machine Learning Engineer passionate about %!s(int=1) and Agile. %!d(string=Jenkins) years of experience in the field, studied Information Technology. Working at a tech company.","locationCity":"Kotka","interests":["Jenkins","AI","Agile","Game Design","Go"],"maxDistancePreference":50,"profilePicture":"/uploads/default-profile.jpg"},{"id":"12","name":"Kade Lockman","birthDate":"1905-06-28T00:00:00Z","age":31,"gender":"Male","biography":"Tech enthusiast and Lead Software Developer with 6 years in the industry. Specialized in GCP and GCP. Computer Science graduate working at a consulting firm.","locationCity":"Pori","interests":["SwiftUI","Scala","GCP","gRPC"],"maxDistancePreference":50,"profilePicture":"/uploads/default-profile.jpg"},{"id":"13","name":"Dameon Conroy","birthDate":"1939-02-23T00:00:00Z","age":54,"gender":"Male","biography":"Mid-level Cloud Architect passionate about %!s(int=1) and Natural Language Processing. %!d(string=Vue.js) years of experience in the field, studied Software Engineering. Working at a software house.","locationCity":"Kotka","interests":["C#","Natural Language Processing","Vue.js"],"maxDistancePreference":50,"profilePicture":"/uploads/default-profile.jpg"},{"id":"14","name":"Joe Wunsch","birthDate":"1936-12-09T00:00:00Z","age":26,"gender":"Other","biography":"Professional Lead with a System Administrator background. 5 years of hands-on experience in Django. Currently focused on TDD development at a Computer Science.%!(EXTRA string=software house)","locationCity":"Kajaani","interests":["Django","Blockchain","TDD"],"maxDistancePreference":50,"profilePicture":"/uploads/default-profile.jpg"},{"id":"15","name":"Felicia Kautzer","birthDate":"1990-05-01T00:00:00Z","age":38,"gender":"Male","biography":"Professional Lead with a DevOps Engineer background. 1 years of hands-on experience in CircleCI. Currently focused on GitHub Actions development at a Software Engineering.%!(EXTRA string=consulting firm)","locationCity":"Oulu","interests":["CircleCI","GitHub Actions"],"maxDistancePreference":50,"profilePicture":"/uploads/default-profile.jpg"},{"id":"16","name":"Lue Steuber","birthDate":"2001-09-18T00:00:00Z","age":39,"gender":"Male","biography":"Tech enthusiast and Lead Mobile Developer with 7 years in the industry. Specialized in MySQL and MySQL. Computer Science graduate working at a IT service provider.","locationCity":"Mikkeli","interests":["MySQL","Clean Code","ASP.NET","Kotlin"],"maxDistancePreference":50,"profilePicture":"/uploads/default-profile.jpg"},{"id":"17","name":"Gustave Langworth","birthDate":"1950-04-13T00:00:00Z","age":56,"gender":"Female","biography":"Mid-level QA Engineer with 2 years of experience, specializing in Bootstrap and Web3. Background in Data Science, currently working at a enterprise company.","locationCity":"Kokkola","interests":["Tailwind CSS","ASP.NET","AI","Web3","Bootstrap"],"maxDistancePreference":50,"profilePicture":"/uploads/default-profile.jpg"}]
```

or

```
[
    {
        "id": "8",
        "name": "Nickolas Kohler",
        "birthDate": "1953-06-23T00:00:00Z",
        "age": 44,
        "gender": "Male",
        "biography": "Professional Lead with a DevOps Engineer background. 6 years of hands-on experience in Next.js. Currently focused on Spring Boot development at a Information Systems.%!(EXTRA string=software house)",
        "locationCity": "Mikkeli",
        "interests": [
            "Next.js",
            "Spring Boot"
        ],
        "maxDistancePreference": 50,
        "profilePicture": "/uploads/default-profile.jpg"
    },
    {
        "id": "9",
        "name": "Bailey Sporer",
        "birthDate": "1938-09-13T00:00:00Z",
        "age": 55,
        "gender": "Other",
        "biography": "Tech enthusiast and Junior Cloud Architect with 4 years in the industry. Specialized in Redux and TypeScript. Cybersecurity graduate working at a software house.",
        "locationCity": "Oulu",
        "interests": [
            "C++",
            "Redux",
            "TypeScript"
        ],
        "maxDistancePreference": 50,
        "profilePicture": "/uploads/default-profile.jpg"
    },
    {
        "id": "10",
        "name": "Greta Funk",
        "birthDate": "2013-09-10T00:00:00Z",
        "age": 50,
        "gender": "Unknown",
        "biography": "Senior Full Stack Developer passionate about %!s(int=7) and Ruby. %!d(string=Kotlin) years of experience in the field, studied Computer Science. Working at a software house.",
        "locationCity": "Vaasa",
        "interests": [
            "Spring Boot",
            "ELK Stack",
            "Kotlin",
            "Agile",
            "Ruby"
        ],
        "maxDistancePreference": 50,
        "profilePicture": "/uploads/default-profile.jpg"
    },
    {
        "id": "11",
        "name": "Quinten Wuckert",
        "birthDate": "1953-12-01T00:00:00Z",
        "age": 47,
        "gender": "Unknown",
        "biography": "Lead Machine Learning Engineer passionate about %!s(int=1) and Agile. %!d(string=Jenkins) years of experience in the field, studied Information Technology. Working at a tech company.",
        "locationCity": "Kotka",
        "interests": [
            "Jenkins",
            "AI",
            "Agile",
            "Game Design",
            "Go"
        ],
        "maxDistancePreference": 50,
        "profilePicture": "/uploads/default-profile.jpg"
    },
    {
        "id": "12",
        "name": "Kade Lockman",
        "birthDate": "1905-06-28T00:00:00Z",
        "age": 31,
        "gender": "Male",
        "biography": "Tech enthusiast and Lead Software Developer with 6 years in the industry. Specialized in GCP and GCP. Computer Science graduate working at a consulting firm.",
        "locationCity": "Pori",
        "interests": [
            "SwiftUI",
            "Scala",
            "GCP",
            "gRPC"
        ],
        "maxDistancePreference": 50,
        "profilePicture": "/uploads/default-profile.jpg"
    },
    {
        "id": "13",
        "name": "Dameon Conroy",
        "birthDate": "1939-02-23T00:00:00Z",
        "age": 54,
        "gender": "Male",
        "biography": "Mid-level Cloud Architect passionate about %!s(int=1) and Natural Language Processing. %!d(string=Vue.js) years of experience in the field, studied Software Engineering. Working at a software house.",
        "locationCity": "Kotka",
        "interests": [
            "C#",
            "Natural Language Processing",
            "Vue.js"
        ],
        "maxDistancePreference": 50,
        "profilePicture": "/uploads/default-profile.jpg"
    },
    {
        "id": "14",
        "name": "Joe Wunsch",
        "birthDate": "1936-12-09T00:00:00Z",
        "age": 26,
        "gender": "Other",
        "biography": "Professional Lead with a System Administrator background. 5 years of hands-on experience in Django. Currently focused on TDD development at a Computer Science.%!(EXTRA string=software house)",
        "locationCity": "Kajaani",
        "interests": [
            "Django",
            "Blockchain",
            "TDD"
        ],
        "maxDistancePreference": 50,
        "profilePicture": "/uploads/default-profile.jpg"
    },
    {
        "id": "15",
        "name": "Felicia Kautzer",
        "birthDate": "1990-05-01T00:00:00Z",
        "age": 38,
        "gender": "Male",
        "biography": "Professional Lead with a DevOps Engineer background. 1 years of hands-on experience in CircleCI. Currently focused on GitHub Actions development at a Software Engineering.%!(EXTRA string=consulting firm)",
        "locationCity": "Oulu",
        "interests": [
            "CircleCI",
            "GitHub Actions"
        ],
        "maxDistancePreference": 50,
        "profilePicture": "/uploads/default-profile.jpg"
    },
    {
        "id": "16",
        "name": "Lue Steuber",
        "birthDate": "2001-09-18T00:00:00Z",
        "age": 39,
        "gender": "Male",
        "biography": "Tech enthusiast and Lead Mobile Developer with 7 years in the industry. Specialized in MySQL and MySQL. Computer Science graduate working at a IT service provider.",
        "locationCity": "Mikkeli",
        "interests": [
            "MySQL",
            "Clean Code",
            "ASP.NET",
            "Kotlin"
        ],
        "maxDistancePreference": 50,
        "profilePicture": "/uploads/default-profile.jpg"
    },
    {
        "id": "17",
        "name": "Gustave Langworth",
        "birthDate": "1950-04-13T00:00:00Z",
        "age": 56,
        "gender": "Female",
        "biography": "Mid-level QA Engineer with 2 years of experience, specializing in Bootstrap and Web3. Background in Data Science, currently working at a enterprise company.",
        "locationCity": "Kokkola",
        "interests": [
            "Tailwind CSS",
            "ASP.NET",
            "AI",
            "Web3",
            "Bootstrap"
        ],
        "maxDistancePreference": 50,
        "profilePicture": "/uploads/default-profile.jpg"
    }
]
```

/////////////////////////////////////////////////////////////////////////////

**/CONNECTIONS**  
The connections endpoint only returns a list of ids.

curl -X GET http://localhost:8080/api/connections -H "Authorization: Bearer **<MYTOKEN>**"

```
[{"id":1},{"id":2}]
```

or

```
[
    {
        "id": 1
    },
    {
        "id": 2
    }
]
```

/////////////////////////////////////////////////////////////////////////////

**/PROFILE/1**

curl -X GET http://localhost:8080/api/profile/1 -H "Authorization: Bearer **<MYTOKEN>**"

```
{"id":1,"userId":1,"firstName":"Eka","lastName":"Eka","birthDate":"1994-01-01T00:00:00Z","age":30,"gender":"female","biography":"o","locationCity":"ooo","interests":["o"],"maxDistancePreference":null,"profilePicture":"1_1.png","securityQuestion":"o","golangProjects":[],"javascriptProjects":[]}
```

or

```
{
    "id": 1,
    "userId": 1,
    "firstName": "Eka",
    "lastName": "Eka",
    "birthDate": "1994-01-01T00:00:00Z",
    "age": 30,
    "gender": "female",
    "biography": "o",
    "locationCity": "ooo",
    "interests": [
        "o"
    ],
    "maxDistancePreference": null,
    "profilePicture": "1_1.png",
    "securityQuestion": "o",
    "golangProjects": [],
    "javascriptProjects": []
}
```

**/USERS/PROFILE/1**

curl -X GET http://localhost:8080/api/users/profile/1 -H "Authorization: Bearer **<MYTOKEN>**"

```
{"id":1,"first_name":"Eka","biography":"o"}
```

or

```
{
    "id": 1,
    "first_name": "Eka",
    "biography": "o"
}
```

/////////////////////////////////////////////////////////////////////////////
