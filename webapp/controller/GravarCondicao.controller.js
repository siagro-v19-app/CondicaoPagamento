sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function(Controller, History, MessageBox, JSONModel) {
	"use strict";

	return Controller.extend("br.com.idxtecCondicaoPagamento.controller.GravarCondicao", {
		onInit: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("gravarcondicao").attachMatched(this._routerMatch, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this._operacao = null;
			this._sPath = null;
			
			var oJSONModel = new JSONModel();
			this.getOwnerComponent().setModel(oJSONModel,"model");
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view");
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			if (this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Inserir Condição de Pagamento"
				});
			
				var oNovoCondicao = {
					"Id": 0,
					"ComEntrada": false,
					"Parcelas": 0,
					"Intervalo": 0,
					"VencimentoFixo": false,
					"DataVencimentoFixo": ""
				};
				
				oJSONModel.setData(oNovoCondicao);
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Condição de Pagamento"
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					},
					error: function(oError) {
						MessageBox.error(oError.responseText);
					}
				});
			}
		},
		
		onSelect: function(evt){
			var bSelect = evt.getParameter("selected");
			var oSelectModel = this.getOwnerComponent().getModel("select");
			oSelectModel.setData({
				codigoEdit: bSelect
			});
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.warning("Preencha todos os campos obrigatórios!");
				return;
			}
			
			if (this._operacao === "incluir") {
				this._createCondicao();
			} else if (this._operacao === "editar") {
				this._updateCondicao();
			}
		},
		
		_goBack: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
					window.history.go(-1);
			} else {
				oRouter.navTo("condicaopgto", {}, true);
			}
		},
		
		_getDados: function(){
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			oDados.Parcelas = oDados.Parcelas ? parseInt(oDados.Parcelas, 0) : 0;
			oDados.Intervalo = oDados.Intervalo ? parseInt(oDados.Intervalo, 0) : 0;

			return oDados;
		},
		
		_createCondicao: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;

			oModel.create("/CondicaoPagamentos", this._getDados(), {
				success: function() {
					MessageBox.success("Condição de pagamento inserida com sucesso!", {
						onClose: function(){
							that._goBack(); 
						}
					});
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_updateCondicao: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			
			oModel.update(this._sPath, this._getDados(), {
					success: function() {
					MessageBox.success("Condição de pagamento alterada com sucesso!", {
						onClose: function(){
							that._goBack();
						}
					});
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("descricao").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			this._goBack();
		}
	});
});