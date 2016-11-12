(function () {
  'use strict';

  var bootstrapModule = angular.module('common.bootstrap', ['ui.bootstrap']);

  bootstrapModule.factory('bootstrap.dialog', ['$uibModal', '$templateCache', modalDialog]);

  function modalDialog($uibModal, $templateCache) {
    var service = {
      deleteDialog: deleteDialog,
      confirmationDialog: confirmationDialog,
      confirmationListDialog: confirmationListDialog
    };

    $templateCache.put('modalDialog.tpl.html',
      '<div>' +
      '    <div class="modal-header">' +
      '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" data-ng-click="cancel()">&times;</button>' +
      '        <h3>{{title}}</h3>' +
      '    </div>' +
      '    <div class="modal-body">' +
      '        <p>{{message}}</p>' +
      '    </div>' +
      '    <div class="modal-footer">' +
      '        <button class="btn btn-primary" data-ng-click="ok()">{{okText}}</button>' +
      '        <button class="btn btn-info" data-ng-click="cancel()">{{cancelText}}</button>' +
      '    </div>' +
      '</div>');
    $templateCache.put('modalDialog.tplList.html',
      '<div>' +
      '    <div class="modal-header">' +
      '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" data-ng-click="cancel()">&times;</button>' +
      '        <h3>{{title}}</h3>' +
      '    </div>' +
      '    <div class="modal-body">' +
      '        <p>{{message}}</p>' +
      '        <ul>' +
      '          <li data-ng-repeat="item in list">{{item}}</li>' +
      '        </ul>' +
      '    </div>' +
      '    <div class="modal-footer">' +
      '        <button class="btn btn-primary" data-ng-click="ok()">{{okText}}</button>' +
      '        <button class="btn btn-info" data-ng-click="cancel()">{{cancelText}}</button>' +
      '    </div>' +
      '</div>');

    return service;

    function deleteDialog(itemName) {
      var title = 'Confirm Delete';
      itemName = itemName || 'item';
      var msg = 'Delete ' + itemName + '?';

      return confirmationDialog(title, msg);
    }

    function confirmationListDialog(title, msg, list, okText, cancelText) {
      var modalOptions = {
        templateUrl: 'modalDialog.tplList.html',
        controller: ModalInstance,
        keyboard: true,
        resolve: {
          options: function () {
            return {
              title: title,
              message: msg,
              list: list,
              okText: okText,
              cancelText: cancelText
            };
          }
        }
      };

      return $uibModal.open(modalOptions).result;
    }

    function confirmationDialog(title, msg, okText, cancelText) {

      var modalOptions = {
        templateUrl: 'modalDialog.tpl.html',
        controller: ModalInstance,
        keyboard: true,
        resolve: {
          options: function () {
            return {
              title: title,
              message: msg,
              okText: okText,
              cancelText: cancelText
            };
          }
        }
      };

      return $uibModal.open(modalOptions).result;
    }
  }

  var ModalInstance = ['$scope', '$uibModalInstance', 'options',
    function ($scope, $uibModalInstance, options) {
      $scope.title = options.title || 'Title';
      $scope.message = options.message || '';
      $scope.list = options.list || [];
      $scope.okText = options.okText || 'OK';
      $scope.cancelText = options.cancelText || 'Cancel';
      $scope.ok = function () { $uibModalInstance.close('ok'); };
      $scope.cancel = function () { $uibModalInstance.dismiss('cancel'); };
    }];
})();
