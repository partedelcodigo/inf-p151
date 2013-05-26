var data2SaveCat = new Array();
var data2SaveCatName = new Array();
var tableProductsExists = false;
var tableCategoriesExists = false;

db = window.openDatabase( "all-brands", "1.0", "all-brands", 700000 );

function checkUpdates() {
	$("#version_message").html("Verificando la versi&oacute;n...");
	$.ajax({
		url:'http://www.codigobase.com/all-brands/getVersion.php',
		dataType: 'json',
		success: function( data ) {
            var currentVersion = data;
            //currentVersion = 1263353305;
            var localVersion = getDbVersion();
            
            console.log("current v " + currentVersion + " local v " + localVersion);
            if( currentVersion > localVersion ) {
            	console.log("updating database");
            	updateDBData( currentVersion );
            }
            else {
            	$("#version_message").html("Versi&oacute;n actualizada");
            }
        },
		error: function( data ) {
            //navigator.notification.alert("hubo un error");
			console.log("There is no Internet conecction");
			console.log("Dont found version");
        }
	});
}

function updateDBData( newDBVersion ) {
	$.ajax({
		url:'http://www.codigobase.com/all-brands/getData.php',
        dataType: 'json',
		success: function( data ) {
            var empObject = eval('(' + JSON.stringify(data) + ')');
            var empObjectLen = empObject.length;

            console.log("Showing GIF");
            
            //$("#loading").removeClass('hide_comp');
            //$("#loading").addClass('show_comp');
			data2Save = empObject;

			db.transaction( checkPreviousData, errorCB, successCB );
			db.transaction( populateDB, errorCB, successCB );
			
			//$("#loading").removeClass('show_comp');
			$("#version_message").html("Base de datos actualizada");
			redirecciona( "companies.html", 500);
			
			updateDBVersion( newDBVersion );
        },
		error: function( data ) {
            //navigator.notification.alert("hubo un error");
			console.log("There is no Internet conecction");
        }
    });
}

function updateDBVersion( version ) {
	localStorage.setItem("version", version);
}

function getDbVersion() {
	try {
		console.log("version " + localStorage.getItem( "version" ));
		if( localStorage.getItem( "version" ) == "undefined" || localStorage.getItem( "version" ) == null )
			return 0;
		else
			return localStorage.getItem( "version" );
	}
	catch (e) {
		return 0;
	}
}

function checkPreviousData( tx ) {
	var query = "SELECT name FROM sqlite_master WHERE type = 'table'";
	
	tx.executeSql( query, [], checkTables, errorCB );
}

function checkTables( tx, result ) {
	var len = result.rows.length;
	
	for( var i = 0; i < len; i++ ) {
		console.log( "Table: " + result.rows.item(i).name );
		if( result.rows.item(i).name == 'products' )
			tableProductsExists = true;
		else if( result.rows.item(i).name == 'categories' )
			tableCategoriesExists = true;
	}
}

function errorCB( err ) {
	alert("error procesing SQL " + err.code);
}

function successCB() {
	console.log("Success!");
	db.transaction( queryDB, errorCB );
}

function queryDB( tx ) {
        //no parece necesario
	//tx.executeSql( "SELECT * FROM products", [], querySuccess, errorCB );
}

function querySuccess( tx, result ) {
	var len = result.rows.length;
	
	/*for( var i = 0; i < len; i++ ) {
		//console.log( "Names: " + result.rows.item(i).title );
		//console.log( "Names: " + result.rows.item(i).price );
		//console.log( "Names: " + result.rows.item(i).status );
	}*/
}

/* Create database and populate it */
function populateDB( tx ) {
	var desc, query;
	
	console.log( "table products: " + tableProductsExists + "--" );
	if( !tableProductsExists ) {
		console.log("starting create tables");	
		var deleteTable = "DROP TABLE IF EXISTS products";
		tx.executeSql( deleteTable );
		var createTable = "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,description BLOB NULL,	price REAL NULL,brand TEXT NULL,category TEXT NULL,status TEXT NULL)";
		tx.executeSql( createTable );
		
		// adding indexes
		tx.executeSql( "CREATE INDEX IF NOT EXISTS filtros ON products (brand, category, status)" );
		console.log("Index created");
		
		for( var i = 0; i < data2Save.length; i++ ) {
			desc = data2Save[i].description;
			desc = addslashes( desc );
			
			query = "INSERT INTO products(title, description, price, brand, category, status) VALUES('" + data2Save[i].title + "', '" + desc + "','" + data2Save[i].price + "','" + data2Save[i].brand + "','" + data2Save[i].category + "','" + data2Save[i].status + "')";
			//--console.log( query );
			tx.executeSql( query );
		}
	}
	
	//if( !tableCategoriesExists ) {
	if( false ) {
		tx.executeSql("DROP TABLE IF EXISTS categories");
		var createTable = "CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,description BLOB NULL,image TEXT NOT NULL)";
		tx.executeSql( createTable );
	        
	    data2SaveCat = new Array();
	    data2SaveCatName = new Object;
	    
	    data2SaveCat.push({title:"Apple",description:"",image:"logo_apple.png"});
	    data2SaveCat.push({title:"Asus",description:"",image:"logo_asus.png"});
	    data2SaveCat.push({title:"HP",description:"",image:"logo_hp.png"});
	    data2SaveCat.push({title:"Samsung",description:"",image:"logo_samsung.png"});
	    data2SaveCat.push({title:"Sony",description:"",image:"logo_sony.png"});
	    data2SaveCat.push({title:"Toshiba",description:"",image:"logo_toshiba.png"});
	    data2SaveCat.push({title:"Acer",description:"",image:"logo_acer.png"});
	    for( var i = 0; i < data2SaveCat.length; i++ ) {
			var cTit = data2SaveCat[i].title;
	                data2SaveCatName[data2SaveCat[i].title]=data2SaveCat[i]
	                var cDes ="1";
			var cImg = data2SaveCat[i].image;
		            //console.log("--->" + i);
			query = "INSERT INTO categories(title, description, image) VALUES('" + cTit+ "', '" + cDes + "','images/" + cImg + "')";
			//console.log("-->"+ query );
			tx.executeSql( query );		
		}
	}
    //bus.filterBrand('');
	
	/*console.log("hidden gif");
	$("#loading").hide();*/
}

var bus={
    category:'',
    brand:'',
    //page:0,
    tot:0,
    status:'',
    filterBrand:function(category){
        bus.category=category;
        bus.brand='';
        var sql_c;
        if(category=='')
            sql_c="SELECT brand FROM products GROUP BY brand ORDER BY brand"
        else
            sql_c="SELECT brand FROM products WHERE category='"+category+"' GROUP BY brand ORDER BY brand ASC"
        console.log("--->" + sql_c);
        db.transaction(function(tx) {
            tx.executeSql(sql_c, [],
                    function(tx, results) {
                        var len = results.rows.length, i,j,dBhtml,c,image;
                        if (len > 1) {
                            //console.log("--->crear listado");
                            dBhtml='';
                            c=1;
                            for (i = 0; i < len; i++) {
                               //console.log("--brand->" + results.rows.item(i).brand);
                                /*for (j = 0; j < data2SaveCat.length; j++) {
                                    if(data2SaveCat[j]['title']==results.rows.item(i).brand)
                                        image=data2SaveCat[j]['image'];
                                }*/
                                console.log("-marca-->" + results.rows.item(i).brand);
                                image=data2SaveCatName[''+results.rows.item(i).brand].image;
                                if (c == 1) {
                                    type = 'a';
                                } else {
                                    if (c == 2) {
                                        type = 'b';
                                    } else {
                                        type = 'c';
                                    }
                                }
                                dBhtml+='<div class="ui-block-'+type+'"><a href="#" onclick="$(\'#div_brand a\').removeClass(\'selected\');$(this).addClass(\'selected\');bus.brand=\''+results.rows.item(i).brand+'\'"><img src="images/'+image+'" /></a></div>';
                                //--dBhtml+='<div class="ui-block-'+type+'"><img src="images/'+image+'" onclick="$(\'#div_brand a\').removeClass(\'selected\');$(this).addClass(\'selected\');bus.brand=\''+results.rows.item(i).brand+'\'" /></div>';
                                c++;
                                if(c==4){
                                    c=1;
                                }
                            }
                        } else {
                           // console.log("--->limpiar");
                            dBhtml='';
                        }
                        $('#div_brand').html(dBhtml);
                    }
            );
        });        
    },
    filterProduct:function(status,pag){
        var sql_p,sql_p_0,sql_p_1,sql_c;
        sql_p_0="SELECT * ";
        sql_p_1="SELECT COUNT(*) AS TOT";
        sql_p=" FROM products WHERE 1=1";
        if(bus.category!='')
            sql_p+=" AND category='"+bus.category+"'";
        if(bus.brand!='')
            sql_p+=" AND brand='"+bus.brand+"'";
        if(status!='All'){
            sql_p+=" AND status='"+status+"'";
        }
        bus.status=status;
            
        sql_p+=" ORDER BY id";
        if(pag==0)
            sql_c=sql_p_1+sql_p;
        sql_p+=" LIMIT "+pag+", 10";
        sql_p=sql_p_0+sql_p;
        
        
var dBhtml;
dBhtml='';
        if(pag==0){
            //console.log("-c-->" + sql_c);
            db.transaction(function(tx) {
                tx.executeSql(sql_c, [],
                    function(tx, results) {
                        $('#ul_products').html('');
                        if (results.rows.length == 1) {
                            bus.tot=results.rows.item(0)['TOT'];
                            dBhtml='<li data-role="list-divider">'+bus.tot + ' productos encontrados.</li>';
                        }
                        else{
                            dBhtml='<li data-role="list-divider">NO EXISTEN productos encontrados.</li>';
                        }
                    });
            });     
        }
            
        db.transaction(function(tx) {
            console.log("-p-->" + sql_p);
            tx.executeSql(sql_p, [],
                    function(tx, results) {
                        var len = results.rows.length, i, dBhtmlMas, image, pro;
                        dBhtmlMas = '';
                        if (len > 0) {
                            //console.log("--->listado productos");
                            for (i = 0; i < len; i++) {
                                pro = results.rows.item(i);
                                image=data2SaveCatName[''+pro.brand].image;
                                dBhtml += '<li><a href="#page_detail_products" onclick="bus.detailProduct('+pro.id+')"><img src="images/' + image + '"/>';
                                dBhtml += '<h2>' + pro.description + '</h2>';
                                dBhtml += '<p><strong>MPN: </strong>' + pro.title;
                                dBhtml += '<br /><strong>Condicion: </strong>' + pro.status;
                                dBhtml += '<br /><span class="note">Precio: $' + pro.price + '</span></p></a></li>';
                                var sig = (pag + 1);
                                if ((sig * 10) < bus.tot)
                                    //dBhtmlMas = '<input type="button" onclick="bus.filterProduct(\'' + bus.status + '\',' + sig + ');" value="Ver Mas" />';
                                    dBhtmlMas = '<br><a id="btnMore" data-role="button" href="#" onclick="bus.filterProduct(\'' + bus.status + '\',' + sig + ');">ver m&aacute;s</a>';
                                }
                        } else {
                            //console.log("--->limpiar");
                            dBhtml = '';
                        }
                        $('#ul_products').html($('#ul_products').html()+dBhtml);
                        $("#ul_products").listview('refresh');
                        $('#div_mas').html(dBhtmlMas);
                        if(dBhtmlMas!=''){
                            $('#btnMore').button();
                            //$('#btnMore').button('refresh');
                        }
                    });
        });
        
            
                        
       
    },
    detailProduct:function(id){
        console.log("--id->" + id);
        var pro,sql_p;
        sql_p="SELECT * FROM products WHERE id="+id;
        console.log("-sql_p-->" + sql_p);
               db.transaction(function(tx) {
                tx.executeSql(sql_p, [],
                    function(tx, results) {
                        if (results.rows.length == 1) {
                            pro=results.rows.item(0);
                            console.dir(pro);
                            console.log("--brand->" + pro.brand);
                            var logos = new Array();
                            logos[0] = new Array('Apple', 'logo_apple.png');
                            logos[1] = new Array('Asus', 'logo_asus.png');
                            logos[2] = new Array('HP', 'logo_hp.png');
                            logos[3] = new Array('Samsung', 'logo_samsung.png');
                            logos[4] = new Array('Sony', 'logo_sony.png');
                            logos[5] = new Array('Dell', 'logo_dell.png');
                            logos[6] = new Array('Toshiba', 'logo_toshiba.png');
                            logos[7] = new Array('Acer', 'logo_acer.png');
                            
                            for( var l = 0; l < logos.length; l++ ) {
                            	if( logos[l][0] == pro.brand ){
                            		//--$('#dProBrand').html(logos[l][1]);                            		
                            		$('#dProBrand').attr('src','images/'+logos[l][1]);
                            	}
                            }
                            
                            $('#dProTitle').html(pro.title);
                            $('#dProStatus').html(pro.status);
                            $('#dProPrice').html(pro.price);
                            $('#dProDescription').html(pro.description);
                            $('#dCategory').html( pro.category );
                        }
                    });
                });
    }
};

if( executeFilters ) {
	db.transaction( populateCategory, errorCB, successCB );
}

function populateCategory( tx ) {
	tx.executeSql("DROP TABLE IF EXISTS categories");
	var createTable = "CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,description BLOB NULL,image TEXT NOT NULL)";
	tx.executeSql( createTable );
        
    data2SaveCat = new Array();
    data2SaveCatName = new Object;
    
    data2SaveCat.push({title:"Apple",description:"",image:"logo_apple.png"});
    data2SaveCat.push({title:"Asus",description:"",image:"logo_asus.png"});
    data2SaveCat.push({title:"HP",description:"",image:"logo_hp.png"});
    data2SaveCat.push({title:"Samsung",description:"",image:"logo_samsung.png"});
    data2SaveCat.push({title:"Sony",description:"",image:"logo_sony.png"});
    data2SaveCat.push({title:"Dell",description:"",image:"logo_dell.png"});
    data2SaveCat.push({title:"Toshiba",description:"",image:"logo_toshiba.png"});
    data2SaveCat.push({title:"Acer",description:"",image:"logo_acer.png"});
    for( var i = 0; i < data2SaveCat.length; i++ ) {
		var cTit = data2SaveCat[i].title;
                data2SaveCatName[data2SaveCat[i].title]=data2SaveCat[i]
                var cDes ="1";
		var cImg = data2SaveCat[i].image;
	            //console.log("--->" + i);
		query = "INSERT INTO categories(title, description, image) VALUES('" + cTit+ "', '" + cDes + "','images/" + cImg + "')";
		//console.log("-->"+ query );
		tx.executeSql( query );		
	}
    
    bus.filterBrand('');
}
