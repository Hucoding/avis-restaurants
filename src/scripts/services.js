var services = {
    getData: (url) =>{
        console.log('2 - Le service à ete demandé');
        let thisData = new Promise(function(done, fail) {
            $.get(url, function(dataPromise) {
                if (dataPromise) {
                    console.log('3 - Le service a trouve un résultat');
                    return done(dataPromise);
                }else {
                    console.log('3 - Le service n\'a pas trouve un resultat');
                    return fail(err)
                }
            })
        });
        return thisData;
    }
}

