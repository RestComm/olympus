angular-routing
==================
Module to that aim to create rest routes for resource with minimal configuration. Inspired by server side mvc framework
###Add module to you app
`angular.module('app',['ngRouting'])`

###Configure your resource
```javascript
app.config(function (routingProvider) {
    routingProvider.withResolve({
        //default resolve object for ruotes, can be overwritten by individual routes
        user: function (authClient) {
            return authClient.user
        }
    }).build([{
        model:'book', //first level resource
        nested:[{
            model:'page' //second level resource
        }]
    }]) //return a angular $routeProvider to allow additional chaining
    .when('/',{
        redirectTo:'/books'
    })
    .when('/login',{
        controller:'LoginCtrl as loginPage',
        templateUrl:'views/login/index.html'
    })
    .otherwise({
        redirectTo:'/books'
    })
})
```
###Generated routes
```javascript
routingProvider.build([{
    model:'book'
}])
```
##routes, controllers, views
| route                   | controller       | view                 |
| ----------------------- |:-----------------|:---------------------|
| /books                  | BookListCtrl     | views/book/list.html |
| /books/new              | NewBookCtrl      | views/book/new.html  |
| /books/:bookId          | BookCtrl         | views/book/show.html |
| /books/:bookId/edit     | EditBookCtrl     | views/book/edit.html |

###Nested routes
```javascript
routingProvider.build([{
    model:'book',
    nested:[{
        model:'page'
    }]
}])
```
####Nested routes start from parent level show route
```
/books/:bookId/pages
/books/:bookId/pages/new
/books/:bookId/pages/:pageId
/books/:bookId/pages/:pageId/edit
```

####Nested routes vies are not nested eg: `views/page/show.html`

###Helpers method (rails inspired)
```javascript
//publish on $rootScope for convenience
app.run(function ($rootScope,routing) {
    $rootScope.h = routing.helpers
})
```
Helper functions generate urls matching with configured `$locationProvider.html5Mode()` and `$locationProvider.hashPrefix()`
```
booksPath()
newBookPath(bookId)
bookPath(bookId)
editBookPath(bookId)

bookPagesPath(bookId)
newBookPagePath(bookId)
bookPagePath(bookId,pageId)
editBookPagePath(bookId,pageId)
```

###Additional model actions
```javascript
    routingProvider.build([{
        model:'book', //first level resource
        actions:['lend']
    }])
```
| route                   | controller       | view                 |
| ----------------------- |:-----------------|:---------------------|
| /books/:bookId/lend     | BookLendCtrl     | views/book/lend.html |
