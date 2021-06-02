# firexui

This repository is for Firebase Hackweek in June 2021.

See [this internal document](https://docs.google.com/document/d/1U_HuZrXhdo2oelgQeJFFnmjuDvkXiP7YjJI_BMnpy14/edit?resourcekey=0-K6AwFUM8KH7bdyHaJ9p6VA#heading=h.zg5zhd2ylch) for context.

# dev setup
```
$ firebase login   # Login with your personal account
$ firebase projects:list
✔ Preparing the list of your Firebase projects
┌──────────────────────┬──────────────────────────┬────────────────┬──────────────────────┐
│ Project Display Name │ Project ID               │ Project Number │ Resource Location ID │
├──────────────────────┼──────────────────────────┼────────────────┼──────────────────────┤
│ hw2021-firexui       │ hw2021-firexui (current) │ 990685987975   │ us-central           │
└──────────────────────┴──────────────────────────┴────────────────┴──────────────────────┘
$ git clone git@github.com:FirebasePrivate/firexui.git
$ cd functions
$ npm install
$ npm run serve
```

Open up `http://localhost:5001/hw2021-firexui/us-central1/helloWorld` in a browser (assumes default settings for the emulator).