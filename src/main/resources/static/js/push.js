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