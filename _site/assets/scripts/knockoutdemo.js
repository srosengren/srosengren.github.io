$(function(){

    /* KO things */
    ko.observableArray.fn.insertAt = function (item, index) {
        var array = this,
            innerArray = array();
        if (isNaN(index))
            index = innerArray.length;
        array.splice(index, 0, item);
        array.valueHasMutated();
    };

    ko.observableArray.fn.moveItem = function (oldIndex, newIndex) {
        var array = this,
            innerArray = array();
        if (isNaN(newIndex))
            newIndex = innerArray.length;
        if (oldIndex === newIndex)
            return;
        var itemToMove = array.splice(oldIndex, 1)[0];
        if (newIndex > oldIndex)
            newIndex--;
        array.splice(newIndex, 0, itemToMove);
        array.valueHasMutated();
    };

    var vm = {
            elements: ko.observableArray()
        },
        dragState = {
            index: 1,
            itemToInsert: {
                item: null,
                index: 0
            }
        };

	/* jqui things */
	$('#draggable').draggable({
        appendTo: '#demo',
		revert: 'invalid',
		helper: 'clone',
		connectToSortable: '#sortable'
	});
	$('#sortable').sortable({
        appendTo: '#demo',
		beforeStop: function (event, ui) {
			var $item = $(ui.item),
				$ph = $(ui.placeholder),
				newIndex = +($ph.next().attr('data-index'));

            if ($item.attr('data-index')) {
                vm.elements.moveItem(+$item.attr('data-index'),newIndex);
            }
            else {
                dragState.itemToInsert = {
                    item: {displayName: ko.observable('sortelement ' + dragState.index)},
                    index: newIndex
                };
                dragState.index++;
                $item.remove();
            }
		},
        update: function(){
            if(dragState.itemToInsert){
                vm.elements.insertAt(dragState.itemToInsert.item,dragState.itemToInsert.index);
                delete dragState.itemToInsert;
            }
        }
	});

	ko.applyBindings(vm,$('#demo')[0]);
});