(function(){
	//var angular = require("./vendor/angular.js");
	var app = angular.module("shoppingCart", ['ngRoute']);


	app.config(['$routeProvider', function(routeProvider) {
		routeProvider
			.when("/", {
				templateUrl: "assets/js/controller/landing.html",
				controller: "productListController"
			})
			.when("/cart", {
				templateUrl: "assets/js/controller/cart-view.html",
				controller: "cartPageController"
			})
			.otherwise("/", {
				templateUrl: "assets/js/controller/landing.html",
				controller: "productListController"
			})

	}])

	app.controller('productListController', ['$scope', '$http', '$rootScope', function(scope, http, rootScope) {

		http.get('/api/records')
		.success(function(response) {
			
			if (response.cartPageData.length > 0) {
				$(".primary-cartIcon .cart-count").text(response.cartPageData.length);
			}
			scope.JSONdata = response.productsInCart;
		});

		scope.viewLightBox = function(){
			var $id = this.data.p_id;
		
			http.get('/api/searchRecord/' + $id)
			.success(function(response) {
				scope.overlayProduct = response;
			});
		}
		
		scope.toggleCloseBtn = function(){
			scope.overlayProduct = false;
		}
	   
		scope.addToBag = function(){
			var selectedColor = [],
				colorsDB = scope.overlayProduct.p_available_options.colors;
			
			
			scope.colorNameArray = [];
			
			angular.forEach(colorsDB, function(colors){
				if (colors.selected) {
					scope.colorNameArray.push({
						"name": colors.name,
						"hexcode": colors.hexcode
					});
				}
			});
			
			
			
			if(scope.colorNameArray.length === 0 ){
				alert("Please Select Color(s) of Product");
				return false;
				
			}else if(typeof(scope.overlayProduct.selectedSize) === "undefined" ){
				alert("Please Select Size");
				return false;
				
			}else if(typeof(scope.overlayProduct.qty) === "undefined" ){
				alert("Please Select Quantity");
				return false;
				
			}else{
				
				var buyProduct = {
					"id": scope.overlayProduct.p_id,
					"p_name": scope.overlayProduct.p_name,
					"p_path": scope.overlayProduct.p_path,
					"p_price": scope.overlayProduct.p_price,
					"p_size": scope.overlayProduct.selectedSize,
					"p_quantity": scope.overlayProduct.qty,
					"p_style": scope.overlayProduct.p_style,
					"p_selectedColors" : scope.colorNameArray
				}
				console.log(buyProduct)
			
				http.post('/api/addToCartProduct', buyProduct)
				.success(function(response) {
					if (response) {
						alert("Product added in Cart");
						
						if (response.length > 0) {
							$(".primary-cartIcon .cart-count").text(response.length);
						}
						
						scope.overlayProduct = false;
					}
				});
			}
		}
		

	}])

	app.controller('cartPageController', ['$scope', '$http', '$rootScope', function(scope, http, rootScope) {

		http.get('/api/cartPage')
		.success(function(response) {
			
			if (response.length > 0) {
				$(".primary-cartIcon .cart-count").text(response.length);
			}

			// converting array to json data
			jsonData = JSON.parse(JSON.stringify(response));

			console.log(response)
			
			// SUB total
			var subTotal = 0;
			$.each(jsonData, function(index, item) {
				subTotal = subTotal + (item.p_quantity * item.p_price);
			});

			//ESTIMATED Total
			var estiTotal = 0,
				discountRec = 0,
				qty = 0,
				promotionCode = "";

			for (var i in jsonData) {
				qty += parseInt(jsonData[i].p_quantity);
			}

			if (qty > 2 && qty <= 3) {
				promotionCode = "JF5";
				discountRec = subTotal * 5 / 100;
				estiTotal += subTotal - discountRec;

			} else if (qty >3 && qty < 11) {
				promotionCode = "JF10";
				discountRec = subTotal * 10 / 100;
				estiTotal += subTotal - discountRec

			} else if (qty >= 11) {
				promotionCode = "JF25";
				discountRec = subTotal * 25 / 100;
				estiTotal += subTotal - discountRec

			} else {
				estiTotal += subTotal;
			}
			
			
			scope.jsonData = jsonData;
			scope.subTotal = subTotal;
			scope.promotionCode = promotionCode;
			scope.discountRecieved =  discountRec;
			scope.estiTotal = estiTotal
			
			
		});
		
		//opening lightbox
		
		scope.viewLightBox = function(){
			
			var $id = this.data.id;
		
			http.get('/api/searchRecord/' + $id)
			.success(function(response) {
				console.log(response)
				scope.overlayProduct = response;
			});
		}
		
		scope.toggleCloseBtn = function(){
			scope.overlayProduct = false;
		}
		
		scope.updatedQty = function(){
			
			var _this = this,
				$p_id = _this.data.id,
				$p_size = _this.data.p_size,
				$p_quantity = this.data.p_size;
				updateProduct = {};
				
			// updateProduct = {
				// "id": $p_id,
				// "p_size": $p_size,
				// "p_quantity": $p_quantity
			// }
			
			// http.post('/api/addToCartProduct', updateProduct)
			// .success(function(response) {
				// if (response) {

					// alert("Product updated in Cart");

					// if (response.length > 0) {
						// $(".primary-cartIcon .cart-count").text(response.length);
					// }
				// }
				
			// });
		}
		/*
		$(document).on("focusout", ".cart-qty input", function(e) {
			e.preventDefault();
			debugger;
			var _this = this,
				$p_id = $(_this).parent().parent().data("productid"),
				$p_size = $(_this).parent().parent().find(".cart-size").text(),
				$p_quantity = $(_this).parent().parent().find(".cart-qty input").val();
				updateProduct = {};
				
			updateProduct = {
				"id": $p_id,
				"p_size": $p_size,
				"p_quantity": $p_quantity
			}
			
			http.post('/api/addToCartProduct', updateProduct)
			.success(function(response) {
				if (response) {

					alert("Product updated in Cart");

					if (response.length > 0) {
						$(".primary-cartIcon .cart-count").text(response.length);
					}
				}
				
			});
		});
		*/
	}])

})()