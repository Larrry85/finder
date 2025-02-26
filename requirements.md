A chat history can be reached from the connected user's profile.

The recommendations are prioritized with the best first.

The me endpoints correctly shortcuts to the appropriate users endpoint.

The user only sees recommendations from their location.

~~The user can see a list of no more than 10 recommendations at a time.~~

The users endpoints return HTTP404 when the id is not found.

This includes when the user is not allowed to see a profile. This is not quite how HTTP404 is described, but it means that a bad actor cannot distinguish between "does not exist", and "has blocked the user".

The chat history API data is paginated.

The profile endpoint returns "about me" type information.

The user can change their biographical data.

The bio endpoint returns biographical data.

~~The backend is implemented in Go.~~

The application works with a single user.

The user can specify preference which target biographical data points.

Incoming connection requests can be rejected.

The connections endpoint only returns a list of ids.

~~The user is not shown any recommendations until they have completed their profile.~~

~~Connection requests can be sent.~~

~~Both users see the same chat history.~~

An unread message icon appears when new chat messages are received in real time.

All user responses return an id in the payload.

The recommendations behave in line with the student's described matching logic.

~~A method was provided to load fictitious users into the system (minimum 100).~~

~~Incoming connection requests can be accepted.~~

Chat messages feature a date and time.

The realtime implementation does not rely on polling.

~~It is possible to register with a username and password.~~

~~It is possible to dismiss a recommendation.~~

~~That recommendation is not shown again after it is dismissed.~~

It refuses to recommend an obviously poor match.

Create two users in an empty system with obviously poor matching characteristics. Check to make sure that they are not recommended.

~~Users can only see profile information when properly allowed.~~

They are recommended
There is an outstanding connection request
They are connected
Chat is only possible between connected profiles.

~~The chat works in real time.~~

The application is secure. Information is appropriately shown to the correct authenticated users only.

The recommendations endpoint only returns a list of ids.

~~The email address is not shown, except to the owner of the profile.~~

~~The email address is not returned in API calls for other users~~

~~A PostgreSQL database is used as the primary application database.~~

The user has a minimum of 5 biographical points to configure.

~~A profile picture can be set.~~

The user can specify a location from a list

~~The user can log out.~~

Chats are ordered with the most recently active chat first.

~~The frontend is implemented in React.~~

~~It is possible to disconnect with a user.~~

The users endpoint returns a name and profile link.

The application is responsive for mobile and desktop browsers.

The profile picture can be removed or changed.

It recommends obviously good matches.

Create two users in an empty system, who appear like they should obviously match

Extra
The recommendation algorithm is exceptional.

The user experience is excellent, usable and well designed.

An offline/online indicator is shown on profile and chat views.

A typing in progress indicator is shown.

It implements proximity-based location filtering.