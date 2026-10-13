### Task 2 Bug
The bug came from the fact that the total transactions and processed total were coming from the transactions that were retrieved from the pagination, so the fix was to make a separate API call that retrieved the information of all the data in the data store.

### Task 5
I would definitely add unit testing for the backend and UI testing for the frontend. This would be kind of tricky with AI. AI can definitely help to find vulnerable points in code and make tests for them, but moving so fast in AI could mean that full regression testing could cause constant friction when moving very fast. This can however ensure quality code and that the app doesn't break in critical places.

I would also check for accessibility. There is a new web standard going out next year, 2027, and if pages don't comply with the new accessibility checks, they can be in big trouble legally. Downloading an extension like Wave to see gaps in accessibility can go a long way to ensure that the app stays neat, readable, and compliant.

If this were a real product, I would also make sure security is very tight with the handling of information. Authentication tokens, row level security on a DB, explicit roles for users, login guards are all necessary to ensure that sensitive government-protected data is not mishandled or given away. I would add user authentication, explicit access to actions or pages, page guards in React, middle wear in Express to check for auth tokens, all in the name of security. Users would also only be able to access data that is connected to them, that way a mischevious user can't just adjust the API url and get any transaction ID they want.

For developer experience, I would add backend validation for the API. If someone were to hit the API directly, they could send invalid params and get useless errors. I would create a UI that interacts directly with the UI so we could hit it directly, like a streamlined POSTMAN setup. That way, developing a backend and ensuring that paths are covered can be much easier. I would also move some shared definitions of schema to a shared location. For example, the Transaction page size could be shared between backend and frontend instead of being defined twice.

Finally, a persistent database! when the app is spun down, the data created by the user gets erased. That is because the data is stored in memory. That can cause HUGE initial lag to the user and inconsistent usage between users. A user could change a transaction or create a transaction and another user dependent on that data would have no way of getting it. Carefully curated data schemas, data retrieval methods (pagination), and security can make for a reliable, safe, and fast DB.

Oh, also I would make the transaction table orderable, by the different columns, but when you order, it takes you back to page 1. Also having a different number to represent the total number of transactions and total processed from your current search parameters or what is on the page would be nice, so you would have 2 indicators. One would say your total transactions and total process for EVERY transaction, and another would give you those numbers given your search and filter parameters. Also I would add a filter option to filter by status/merchant/card or a date time picker to filter by dates, or an amount filter to go more than, less than, or between amounts.

Another upgrade I would make would be to use query libraries that scale well with projects. Using useEffect works well here, but once the project scales and state and forms become more complicated, more powerful querying and state tools like reactQuery, zod, and zustand can make the project scale well and maintain performance. 

ALSO ALSO WHAT ARE WE DOING PUTTING API KEY HARCODED IN CONFIG? Had to remove the unused one and moved the used to to .env

### Questions
## Data flow
When there is a key stroke in the search box, the page reloads with information since a change in the input state triggers a search. I saw that and I fixed it by making a search button to trigger the search, I did that as part of task 1, not knowing that there was a question for this, sorry. The old functionality had 2 issues. One is that it didn't scale well with data. Having a data store would front-load a ton of data onto the local instance which could slow down the app or make it take up precious space. With a massive dataset it would also cause slowness with unperformant filtering and search algorithms. The other issue is that each key stroke would get the user out of focus of the search box, so the user would have to deliberately click on the search box after each keystroke, making it bad user experience.

## Task 1 call
When doing pagination, I always let my backend handle everything. The DB should be the source of truth so hitting the backend to get the paginated data means getting the correct data in small slices, every time. It also allos for incredible scaling.

## Ship/no Ship
I would not ship. The lack of persistent data makes it a useless CRUD app. I would make an SQL database, with normalized data schemas and indexed queryable fields to make it performant and scalable. I would also have a users table and add authentication and authorization so people can log in and only see and do things that they are allowed to see and do. I think that is the bare minimum to ship. Also, I wonder how 'Deleting' would work. Since this is potential sensitive data that should persist, maybe a 'hard' delete would be too much, but a soft delete that would hide data from the user could be good. Unless that is not what product wants or is the actual functino of the VOIDED status, but that is a question for product, I just feel like it is not a true CRUD app without addressing the D in CRUD.

With more time, I would've implemented the UI fixes mentioned above and the code cleanup that would allow for shareable schema definitions. With even more freedom and time, I would add a DB, authentication, authorization, testing, and developer tools with more powerful libraries. 

I took a couple of liberties. For example, I changed the transactions number in the summary bar to be a total transactions number, which was not explicitly stated before. I change the modal chen clicking on a row to be it's own page. I reused the same component as the new transaction view for the editing transaction for nicer code standards and added a success toast for the user. I fixed the search bar thing as part of task 1, whoops. 

I hope you like it, it was fun, thanks!