// Этот скрипт отвечает за работу всплывающих уведомлений об ошибках.
// Когда появляется красная плашка с ошибкой — она сама исчезнет через 5 секунд,
// либо её можно закрыть вручную кликом.
// Если хочешь изменить время исчезновения — меняй значение 5000 (5 секунд) ниже.
document.addEventListener('DOMContentLoaded', () => {
    const errorToast = document.querySelector('.error-toast');

    if (errorToast) {
        // Удаляем плашку после анимации
        setTimeout(() => {
            errorToast.remove();
        }, 5000); // Совпадает с временем fadeOut анимации

        // Можно закрыть кликом
        errorToast.addEventListener('click', () => {
            errorToast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => errorToast.remove(), 300);
        });
    }
});