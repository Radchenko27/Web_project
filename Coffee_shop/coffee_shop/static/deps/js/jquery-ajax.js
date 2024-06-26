// Когда html документ готов (прорисован)
$(document).ready(function () 
{
    // берем в переменную элемент разметки с id jq-notification для оповещений от ajax
    var successMessage = $("#jq-notification");

     // Ловим собыитие клика по кнопке добавить в корзину
     $(document).on("click", ".add-to-basket", function (e) {
         // Блокируем его базовое действие
         e.preventDefault();

         // Берем элемент счетчика в значке корзины и берем оттуда значение
         var goodsInBasketCount = $("#goods-in-basket-count");
         var basketCount = parseInt(goodsInBasketCount.text() || 0);

         // Получаем id товара из атрибута data-dish-id
         var dish_id = $(this).data("dish-id");
          
         // Из атрибута href берем ссылку на контроллер django
         var add_to_basket_url = $(this).attr("href");
        
         console.log("Dish ID: ", dish_id);
         // делаем post запрос через ajax не перезагружая страницу
         $.ajax({
             type: "POST",
             url: add_to_basket_url,
             data: {
                 dish_id: dish_id,
                 csrfmiddlewaretoken: $("[name=csrfmiddlewaretoken]").val(),
             },
             success: function (data) {
                 // Сообщение
                 successMessage.html(data.message);
                 successMessage.fadeIn(400);
                 // Через 7сек убираем сообщение
                 setTimeout(function () {
                     successMessage.fadeOut(400);
                 }, 7000);
            

                 // Увеличиваем количество товаров в корзине (отрисовка в шаблоне)
                 basketCount++;
                 goodsInBasketCount.text(basketCount);

                 // Меняем содержимое корзины на ответ от django (новый отрисованный фрагмент разметки корзины)
                 var basketItemsContainer = $("#basket-items-container");
                 basketItemsContainer.html(data.basket_items_html);

             },
             error: function (data) {
                 console.log("Ошибка при добавлении товара в корзину");
             },
         });
     });




    // Ловим собыитие клика по кнопке удалить товар из корзины
    $(document).on("click", ".remove-from-basket", function (e) {
        // Блокируем его базовое действие
        e.preventDefault();

        // Берем элемент счетчика в значке корзины и берем оттуда значение
        var goodsInBasketCount = $("#goods-in-basket-count");
        var basketCount = parseInt(goodsInBasketCount.text() || 0);

        // Получаем id корзины из атрибута data-basket-id
        var basket_id = $(this).data("basket-id");
        // Из атрибута href берем ссылку на контроллер django
        var remove_from_basket = $(this).attr("href");
    
        // делаем post запрос через ajax не перезагружая страницу
        $.ajax({

            type: "POST",
            url: remove_from_basket,
            data: {
                basket_id: basket_id,
                csrfmiddlewaretoken: $("[name=csrfmiddlewaretoken]").val(),
            },
            success: function (data) {
                // Сообщение
                successMessage.html(data.message);
                successMessage.fadeIn(400);
                // Через 7сек убираем сообщение
                setTimeout(function () {
                    successMessage.fadeOut(400);
                }, 7000);

                // Уменьшаем количество товаров в корзине (отрисовка)
                basketCount -= data.quantity_deleted;
                goodsInBasketCount.text(basketCount);

                // Меняем содержимое корзины на ответ от django (новый отрисованный фрагмент разметки корзины)
                var basketItemsContainer = $("#basket-items-container");
                basketItemsContainer.html(data.basket_items_html);

            },

            error: function (data) {
                console.log("Ошибка при добавлении товара в корзину");
            },
        });
    });




    // Теперь + - количества товара 
    // Обработчик события для уменьшения значения
    $(document).on("click", ".decrement", function () {
        // Берем ссылку на контроллер django из атрибута data-basket-change-url
        var url = $(this).data("basket-change-url");
        // Берем id корзины из атрибута data-basket-id
        var basketID = $(this).data("basket-id");
        // Ищем ближайшеий input с количеством 
        var $input = $(this).closest('.input-group').find('.number');
        // Берем значение количества товара
        var currentValue = parseInt($input.val());
        // Если количества больше одного, то только тогда делаем -1
        if (currentValue > 1) {
            $input.val(currentValue - 1);
            // Запускаем функцию определенную ниже
            // с аргументами (id карты, новое количество, количество уменьшилось или прибавилось, url)
            updateCart(basketID, currentValue - 1, -1, url);
        }
    });

    // Обработчик события для увеличения значения
    $(document).on("click", ".increment", function () {
        // Берем ссылку на контроллер django из атрибута data-basket-change-url
        var url = $(this).data("basket-change-url");
        // Берем id корзины из атрибута data-basket-id
        var basketID = $(this).data("basket-id");
        // Ищем ближайшеий input с количеством 
        var $input = $(this).closest('.input-group').find('.number');
        // Берем значение количества товара
        var currentValue = parseInt($input.val());

        $input.val(currentValue + 1);

        // Запускаем функцию определенную ниже
        // с аргументами (id карты, новое количество, количество уменьшилось или прибавилось, url)
        updateCart(basketID, currentValue + 1, 1, url);
    });

    function updateCart(basketID, quantity, change, url) {
        $.ajax({
            type: "POST",
            url: url,
            data: {
                basket_id: basketID,
                quantity: quantity,
                csrfmiddlewaretoken: $("[name=csrfmiddlewaretoken]").val(),
            },
 
            success: function (data) {
                 // Сообщение
                successMessage.html(data.message);
                successMessage.fadeIn(400);
                 // Через 7сек убираем сообщение
                setTimeout(function () {
                     successMessage.fadeOut(400);
                }, 7000);
 
                // Изменяем количество товаров в корзине
                var goodsInBasketCount = $("#goods-in-basket-count");
                var basketCount = parseInt(goodsInBasketCount.text() || 0);
                basketCount += change;
                goodsInBasketCount.text(basketCount);

                // Меняем содержимое корзины
                var cartItemsContainer = $("#basket-items-container");
                cartItemsContainer.html(data.basket_items_html);

            },
            error: function (data) {
                console.log("Ошибка при добавлении товара в корзину");
            },
        });
    }
});