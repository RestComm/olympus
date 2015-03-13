angular.module('ngRouting',['ngRoute'])
    .constant('routingUtils',{
        capitalize: function  (string) {
            return string.charAt(0).toUpperCase() + string.slice(1)
        },
        collectionRoute: function (base,model) {
            return (base.path || '')+'/'+model+'s'
        },
        resourceRoute: function (base,model) {
            return this.collectionRoute(base,model)+'/:'+this.modelId(model)
        },
        editResourceRoute: function (base,model) {
            return this.resourceRoute(base,model)+'/edit'
        },
        newResourceRoute: function (base,model) {
            return this.collectionRoute(base,model)+'/new'
        },
        modelId : function (model) {
            return model+'Id'
        }
    })
    .provider('routing',function ($routeProvider,routingUtils,$locationProvider,$logProvider,$interpolateProvider) {
        var functions = { }
            ,capitalize = routingUtils.capitalize
            ,injector = angular.injector(['ng'])
            ,$log     = injector.invoke($logProvider.$get)
            ,$interpolate = injector.invoke($interpolateProvider.$get)
        function makeRoute(route, base){
            base = base || {models:[]}
            var actions = route.actions || []
            var routes = {};
                ['collectionRoute',
                 'resourceRoute',
                 'editResourceRoute',
                 'newResourceRoute'].forEach(function (method) {
                        routes[method] = routingUtils[method](base,route.model)
                 })
            var model = route.model
                , Model = capitalize(model)
                , resolve =  route.resolve || provider.resolve
                , collectionRoute = {
                    controller: Model+'ListCtrl'
                    ,resolve: resolve
                    ,templateUrl: provider.viewTemplate({model:model,action:'list'})
                }
                , resourceRoute = {
                    controller: Model+'Ctrl'
                    ,resolve: resolve
                    ,templateUrl: provider.viewTemplate({model:model,action:'show'})
                }
                , newResourceRoute = {
                    controller:'New'+Model+'Ctrl'
                    ,resolve: resolve
                    ,templateUrl: provider.viewTemplate({model:model,action:'new'})
                }
                , editResourceRoute = {
                    controller:'Edit'+Model+'Ctrl'
                    ,resolve: resolve
                    ,templateUrl: provider.viewTemplate({model:model,action:'edit'})
                }
                , additionalRoutes = actions.map(function (action) {
                    return {
                        action: action
                        , controller: Model+capitalize(action)+'Ctrl'
                        , resolve: resolve
                        , templateUrl: provider.viewTemplate({model:model, action: action})
                    }
                })
                
            base.models.push(model)
            var path = base.models[0] + base.models.slice(1).map(capitalize).join()
            functions[path + 'sPath'] = {path:routes.collectionRoute , models: base.models}
            functions[path + 'Path']  = {path:routes.resourceRoute   , models: base.models}
            functions['new'+capitalize(path) + 'Path']  = {path:routes.newResourceRoute , models: base.models}
            functions['edit'+capitalize(path) + 'Path'] = {path:routes.editResourceRoute, models: base.models}

            actions.forEach(function (action) {
                functions[path+capitalize(action)+'Path'] = {
                    path: routes.resourceRoute+'/'+action
                    , models: base.models
                }
            })

            function when (path,route) {
                $routeProvider.when(path,route)
                $log.debug(path,route)
            }

            $logProvider.debugEnabled() && console.group && console.group(model)
            
            when(routes.collectionRoute  ,collectionRoute)
            when(routes.newResourceRoute ,newResourceRoute)
            when(routes.resourceRoute    ,resourceRoute)
            when(routes.editResourceRoute,editResourceRoute)

            additionalRoutes.forEach(function (additionalRoute) {
                when(functions[path+capitalize(additionalRoute.action)+'Path'].path, additionalRoute)
            })

            if(route.nested){
                angular.forEach(route.nested,function (nested) {
                    base.path = routes.resourceRoute
                    makeRoute(nested,base)
                })
            }
            $logProvider.debugEnabled() && console.groupEnd && console.groupEnd()
        }

        function spreadArguments(fn,models) {
            return function () {
                var scope = {},
                        args = arguments
                models.forEach(function (model,i) {
                    scope[routingUtils.modelId(model)] = angular.isObject(args[i]) ? args[i].id :  args[i]
                })
                return fn(scope)
            }
        }
        
        var pathRe = new RegExp(':([^/]*)','g')
        var provider = {
            viewTemplate: "views/{{model}}/{{action}}.html",
            build:function (routes) {
                this.viewTemplate = $interpolate(provider.viewTemplate)
                provider.basePath = $locationProvider.html5Mode() ? '' : ('#' + $locationProvider.hashPrefix()),
                angular.forEach(routes,makeRoute)
                return $routeProvider
            },
            withResolve: function(resolve){
                this.resolve = resolve
                return this
            },
            $get:function ($interpolate, $rootScope) {
                var methods = {}
                Object.keys(functions).forEach(function (method) {
                    var path = provider.basePath + functions[method].path.replace(pathRe,'{{$1}}')
                        ,interpolate = $interpolate(path)
                    methods[method] = spreadArguments(interpolate,functions[method].models)
                })
                Object.keys(functions).forEach(function (method) {
                    var path = functions[method].path.replace(pathRe,'{{$1}}')
                        ,interpolate = $interpolate(path)
                    methods[method.replace('Path','Route')] = spreadArguments(interpolate,functions[method].models)
                })
                return {
                    helpers:methods
                }
            }
        }
        return provider
    })