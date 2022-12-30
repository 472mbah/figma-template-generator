const recursiveDeepCopy = (obj) => 
    Object.keys(obj).reduce((global, key)=>{

        if (typeof obj[key] === 'object') {

            global[key] = { ...recursiveDeepCopy(obj[key]) }

        }else {
            global[key] = obj[key];
        }
        return global;

    }, {})




let obj = { names:{firstName:{value:'Momodou'}, lastName:'Bah'}, homes:{ prime:{name:'Gambia', addres:'XYZ'}, sub:{name:'UK', addres:'abc'} } }
let secondObj = JSON.parse(JSON.stringify(obj))

// recursiveDeepCopy(obj);
true;
obj.names.firstName.value = "Ibrahim"
true;
obj.names.firstName = "Mariam"
true;
let x = 2;


