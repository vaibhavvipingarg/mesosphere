This is the demo application for representing the servers cluster.
Browsers local storage is being used to persist data and act as the data store.

3rd Party Libraries:
1. Angular - Modelling the application is easy and intuitive. 2 way data-binding is a must have for applications representing server state
2. Momement.js and liveStamp.js for showing the "2 mins ago.." etc timestamps. These libraries provide fast and easy way to do this.
3. Bootstrap - Used minimally for styles only - I used it because...well, its bootstrap :)

The logic and controls as simple as possible, yet scalable. The idea here is present a good POC for the required functionality.

I have used the colors and images to best of my judgement.
I have not included any tests - as I did not have sufficient time. The plan was to implement that using mocha and karma.

Instructions for running-
Open the folder containing the project. Run the index.html file in the browser of choice- You will see 2 errors for http fail in this case

**Better way- Just paste the folder in your local server and access the index.html file.