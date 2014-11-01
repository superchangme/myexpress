/**
 * Created by Administrator on 2014/10/28.
 */
_server="http://127.0.0.1:3000";
if(typeof require!=="undefined"){
    require.config({
        baseUrl: '/javascripts',
        paths:{
            "tmpl":"template",
            "uuid":"uuid",
            "filereader":"filereader"
        },
        map: {
            // '*' means all modules will get 'jquery-private'
            // for their 'jquery' dependency.
            '*': { 'jquery': 'jquery-private' },

            // 'jquery-private' wants the real jQuery module
            // though. If this line was not here, there would
            // be an unresolvable cyclic dependency.
            'jquery-private': { 'jquery': 'jquery-1.11.0.min' }
        },
        "shim": {
            "jquery.cookie": ["jquery"]
        }
    });
}

