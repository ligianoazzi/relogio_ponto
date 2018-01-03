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
			controller   : 'CadastroCartaoPontoController',
			controllerAs : 'cadastroCartaoPonto'
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
    $scope.preLoader = true;
    $scope.contador = 0;

    $scope.buscarColaboradoresPonto = function () {
        $scope.mostrarRecentes = false;

        // Ao carregar a tela, busca os colaboradores
        CadastroCartaoPontoFactory
        .buscarColaboradoresPonto()
        .then(function(result){
            $scope.colaboradores = result.data.naoRegistrados;
            $scope.registrosRecentes = result.data.registrosRecentes;
            iniciarRelogio();
            $scope.preLoader = false;
        });


    };

    $scope.alternarLista = function() {
        $scope.mostrarRecentes = $scope.mostrarRecentes ? false : true;
    }

    $scope.configDialogRegistroPonto = function(event, dados) {
        // recebendo a hora atual;
        let data = new Date();
        dados.hora = document.getElementById('relogio').innerHTML;
        dados.data = data.getFullYear()+"-"+(data.getMonth()+1)+"-"+data.getDate();


        let url = "app/templates/dialogRegistroPonto.html";
        let ctrl = "DialogRegistroPontoController";
        let locals = { dados:dados };


		$mdDialog.show({
		    controller          : ctrl,
		    controllerAs        : 'ctrl',
		    templateUrl         : url,
		    parent              : angular.element(document.body),
		    targetEvent         : event,
		    clickOutsideToClose : false,
		    multiple            : true,
		    locals              : locals,
		    skipHide: true, // Faz com que dialogs atrás não sejam escondidas
		})
		.then(function(result){
            // $scope.preLoader = true;
            $scope.buscarColaboradoresPonto();


            $mdDialog.show({
                controller: function($mdDialog, $timeout) {
                    var dialog = this;
                    this.esconder = function() {
                        console.log("teste");
                        $mdDialog.hide();
                    }
                    $timeout(dialog.esconder, 1000);
                    

                },
                controllerAs        : 'ctrl',
                template            : '<md-dialog aria-label="Aviso">' +
                                       '  <md-dialog-content>'+
                                       '    <div class="md-dialog-content">'+
                                       '  <span class="md-headline">Registrado!</span>' +
                                       '    </md-card>'+
                                       '  </div>' +
                                       // '  <md-dialog-actions>' +
                                       // '    <md-button ng-click="ctrl.hide()" class="md-primary">' +
                                       // '      Ok' +
                                       // '    </md-button>' +
                                       // '  </md-dialog-actions>' +
                                       '</md-dialog>',
                parent              : angular.element(document.body),
                targetEvent         : event,
                // clickOutsideToClose : false,
                // multiple            : true,
                // locals              : locals,
                skipHide: true, // Faz com que dialogs atrás não sejam escondidas
              });

            
        });
    }

    $scope.buscarColaboradoresPonto();

    function iniciarRelogio() {
        var today = new Date();
        var h = today.getHours();

        var m = today.getMinutes();
        var s = today.getSeconds();

        var d = today.getDate();
        var mM = (today.getMonth())+1; // aumenta 1 porque os meses começam em 0
        var yyyy = today.getFullYear();

        m = formatarTempo(m);
        s = formatarTempo(s);
        d = formatarTempo(d);

        $scope.verificaHora(m);

        document.getElementById('relogio').innerHTML =
        h + ":" + m + ":" + s;

        document.getElementById('dia').innerHTML =
        d + "/" + mM + "/" + yyyy;

        var t = setTimeout(iniciarRelogio, 500);
    }

    function formatarTempo(i) {
        if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
    }

    $scope.verificaHora = function(minutos) {
        if(minutos == "0") {
            $scope.buscarColaboradoresPonto();
        }
    }
});

angular.module("myApp")
.controller("DialogRegistroPontoController", function($scope, $mdDialog, dados, $timeout, CadastroCartaoPontoFactory) {
    
    $scope.dados = dados;
    $scope.bolasPretas = [];
	$scope.bolasVermelhas = [];
	$scope.bolasBrancas = [1,2,3,4];
	$scope.senha = "";

    $scope.preLoader = true;

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
    	let senha = $scope.senha;
    	let ultimoChar = senha.length-1;

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
    	for(let i=1; i<=num;i++){
    		$scope.bolasBrancas.push(i);
    	}
    }

	$scope.contaBolasPretas = function(num) {
        $scope.bolasPretas = [];
        for(let i=1; i<=num;i++){
            $scope.bolasPretas.push(i);
        }
    }

    $scope.contaBolasVermelhas = function(num) {
    	$scope.bolasVermelhas = [];
    	for(let i=1; i<=num;i++){
    		$scope.bolasVermelhas.push(i);
    	}
    }

    $scope.setDataNascimento = function() {
    	let dataNascimento = $scope.dados.dt_nascimento;
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
