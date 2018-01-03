angular.module('myApp',['ui.router', 'ngMaterial', 'ngAria', 'ngAnimate']);

var url = "http://localhost";
var url_web = "http://www.ergoseg.com.br";
url = url_web;

angular.module('myApp')
.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/cadastroCartaoPonto');

	$stateProvider
		.state('cadastroCartaoPonto', {
			url          : '/cadastroCartaoPonto',
			templateUrl  : 'app/templates/cadastroCartaoPontoView.html',
			controller   : 'CadastroCartaoPontoController'
		});
});

angular.module('myApp')
.config(function($mdThemingProvider) {

  $mdThemingProvider.theme('default')
        .primaryPalette('teal',
        {
            'default': '800',
            'hue-1'  : '300',
            'hue-2'  : '500',
            'hue-3'  : '600',
        })
        .accentPalette('amber',
        {
            'default' : '500',
            'hue-1' : '500',
            'hue-2' : '900',
        })
        .warnPalette('red', {
            'default' : '500'
        })
        .backgroundPalette('grey');

});


angular.module("myApp")
.factory("CadastroCartaoPontoFactory", function CadastroCartaoPontoFactory($http) {
  return {
	    buscarColaboradoresPonto: function(dados) {
			return $http.get(
				url+"/comercial/Operacional/index.php/operacional/cadastro/cadastroCartaoPontoController/buscarColaboradoresPonto");
		},
	    inserirRegistroPonto: function(dados) {
			return $http({
				method : 'POST',
				url : url+"/comercial/Operacional/index.php/operacional/cadastro/cadastroCartaoPontoController/inserirRegistroPonto/",
				data: dados,
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			});
		}
	}
});


angular.module("myApp")
.controller("CadastroCartaoPontoController",  function($scope, $http, $mdDialog, $timeout, CadastroCartaoPontoFactory) {

	$scope.url_web = url_web;
	$scope.colaboradores = [];
    $scope.registrosRecentes = [];
    $scope.contador = 0;

    $scope.buscarColaboradoresPonto = function () {
        $scope.mostrarRecentes = false;

        // Ao carregar a tela, busca os colaboradores
        CadastroCartaoPontoFactory
        .buscarColaboradoresPonto()
        .then(function(result){
            $scope.colaboradores = result.data.naoRegistrados;
            $scope.registrosRecentes = result.data.registrosRecentes;
        });

    };

    $scope.alternarLista = function() {
        $scope.mostrarRecentes = $scope.mostrarRecentes ? false : true;
    }

    $scope.configDialogRegistroPonto = function(event, dados) {
        // recebendo a hora atual;
        var data = new Date();
        var h = data.getHours();
        var m = data.getMinutes();
        var s = data.getSeconds();

        var d = data.getDate();
        var mM = $scope.formatarTempo((data.getMonth())+1); // aumenta 1 porque os meses começam em 0
        var yyyy = data.getFullYear();

        m = $scope.formatarTempo(m);
        s = $scope.formatarTempo(s);
        d = $scope.formatarTempo(d);

        dados.hora = h + ":" + m + ":" + s;
        dados.data = yyyy+"-"+mM+"-"+d;
		$mdDialog.show({
		    controller          : "DialogRegistroPontoController",
		    templateUrl         : "app/templates/dialogRegistroPonto.html",
		    targetEvent         : event,
		    clickOutsideToClose : false,
		    locals              : { dados:dados },
		})
		.then(function(result){
            $scope.buscarColaboradoresPonto();


            $mdDialog.show({
                controller: function($mdDialog, $timeout) {
                    var dialog = this;
                    this.esconder = function() {
                        $mdDialog.hide();
                    }
                    $timeout(dialog.esconder, 1000);
                    

                },
                template            : '<md-dialog aria-label="Aviso">' +
                                       '  <md-dialog-content>'+
                                       '    <div class="md-dialog-content">'+
                                       '  <span class="md-headline">Registrado!</span>' +
                                       '    </md-card>'+
                                       '  </div>' +
                                       '</md-dialog>',
                targetEvent         : event
              });

            
        });
    }

    $scope.buscarColaboradoresPonto();

    $scope.formatarTempo = function(i) {
        if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
    }

    setInterval(
    	function() {
    	 $scope.buscarColaboradoresPonto();
    	}, 1800000);

});

angular.module("myApp")
.controller("DialogRegistroPontoController", function($scope, $mdDialog, dados, $timeout, CadastroCartaoPontoFactory) {
    
    $scope.dados = dados;
    $scope.bolasPretas = [];
	$scope.bolasVermelhas = [];
	$scope.bolasBrancas = [1,2,3,4];
	$scope.senha = "";

    $scope.cancel = function(){
        $mdDialog.cancel(); 
    };

    $scope.verificarData = function() {
        if($scope.dataNascimento == $scope.senha) {
        	CadastroCartaoPontoFactory
            .inserirRegistroPonto($scope.dados)
        	.then(function(result) {
            	$mdDialog.hide();
        	});
        }
        else{

            // Aviso vermelho
            $scope.contaBolasBrancas(0);
            $scope.contaBolasPretas(0);
            $scope.contaBolasVermelhas(4);

            // Reseta as cores
            $timeout(function() {
                $scope.contaBolasBrancas(4);
                $scope.contaBolasPretas(0);
                $scope.contaBolasVermelhas(0);
                
                // Limpa a senha
                $scope.senha = "";
            }, 700);
        }
    };

    // Controla o teclado
    $scope.digitar = function(botao) {
    	var senha = $scope.senha;
    	var ultimoChar = senha.length-1;

    	if(botao == "backspace") {
    		senha = senha.slice(0, ultimoChar);
    	}
    	else if(botao == "clear") {
    		senha = "";
    	}
    	else{
			if(senha.length < 4) {
    			senha += botao;
    		}
    	}

		$scope.contaBolasBrancas(4-senha.length);
		$scope.contaBolasPretas(senha.length);
    	$scope.senha = senha;

        
        if(senha.length == 4) {
            $scope.verificarData();
        }
    }

    $scope.contaBolasBrancas = function(num) {
    	$scope.bolasBrancas = [];
    	for(var i=1; i<=num;i++){
    		$scope.bolasBrancas.push(i);
    	}
    }

	$scope.contaBolasPretas = function(num) {
        $scope.bolasPretas = [];
        for(var i=1; i<=num;i++){
            $scope.bolasPretas.push(i);
        }
    }

    $scope.contaBolasVermelhas = function(num) {
    	$scope.bolasVermelhas = [];
    	for(var i=1; i<=num;i++){
    		$scope.bolasVermelhas.push(i);
    	}
    }

    $scope.setDataNascimento = function() {
    	var dataNascimento = $scope.dados.dt_nascimento;
    	dataNascimento = dataNascimento.split("-");
    	$scope.dataNascimento = dataNascimento[2]+dataNascimento[1];
    }

    $scope.setDataNascimento();

});

angular.module("myApp")
.directive("tecladoNumerico", function() {
	return {
		restrict:"E",
		templateUrl: "app/templates/directives/teclado-numerico.html"
	}
});
