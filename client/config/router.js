Router.configure({
    layoutTemplate: 'masterLayout',
    notFoundTemplate: 'notFound',
    yieldTemplates: {
        'header': { to: 'header' },
        'footer': { to: 'footer' }
    }
});