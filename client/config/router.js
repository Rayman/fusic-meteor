Router.configure({
    layoutTemplate: 'masterLayout',
    notFoundTemplate: 'notFound',
    yieldTemplates: {
        'header': { to: 'header' },
        'footer': { to: 'footer' }
    }
});

IronRouterProgress.configure({
  enabled : true,
  delay: 100,
});