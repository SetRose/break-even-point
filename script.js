document.getElementById('breakeven-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Очистка предыдущих сообщений об ошибках
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.style.display = 'none');

    // Получение значений из полей ввода
    const FC = parseFloat(document.getElementById('fixedCosts').value);
    const VC = parseFloat(document.getElementById('variableCosts').value);
    const P = parseFloat(document.getElementById('pricePerUnit').value);

    let hasError = false;

    // Проверка корректности введенных данных
    if (isNaN(FC) || FC < 0) {
        showError('fixedCosts', 'Введите корректное значение постоянных затрат.');
        hasError = true;
    }

    if (isNaN(VC) || VC < 0) {
        showError('variableCosts', 'Введите корректное значение переменных затрат.');
        hasError = true;
    }

    if (isNaN(P) || P <= 0) {
        showError('pricePerUnit', 'Введите корректную цену продажи.');
        hasError = true;
    }

    if (!hasError && VC >= P) {
        showError('variableCosts', 'Переменные затраты должны быть меньше цены продажи.');
        hasError = true;
    }

    if (hasError) {
        return;
    }

    // Расчёты
    const MD = P - VC;
    const MR = (MD / P) * 100;
    const Q = FC / MD;
    const S = FC / (MR / 100);

    // Отображение результатов
    document.getElementById('results').classList.remove('hidden');

    // Генерация и отображение расчётов
    displayCalculations(FC, VC, P, MD, MR, Q, S);

    // Построение графика
    buildChart(Q, FC, VC, P);

    // Плавная прокрутка к результатам
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
});

function showError(inputId, message) {
    const inputGroup = document.getElementById(inputId).parentElement;
    const errorMessage = inputGroup.querySelector('.error-message');
    errorMessage.innerText = message;
    errorMessage.style.display = 'block';
}

function displayCalculations(FC, VC, P, MD, MR, Q, S) {
    const calculationElement = document.querySelector('.calculation');
    calculationElement.innerHTML = '';

    // Определение класса для MR
    const mrClass = MR >= 25 ? 'good-value' : 'bad-value';

    // Маржинальный доход (MD)
    const mdFormula = `$$ MD = P - VC = ${P} - ${VC} = ${MD.toFixed(2)} $$`;
    const mdElement = document.createElement('p');
    mdElement.innerHTML = `Маржинальный доход (MD): <span class="formula">${mdFormula}</span>`;
    calculationElement.appendChild(mdElement);

    // Маржинальная рентабельность (MR)
    const mrFormula = `$$ MR = \\frac{MD}{P} \\times 100\\% = \\frac{${MD.toFixed(2)}}{${P}} \\times 100\\% = \\color{${mrClass === 'good-value' ? 'green' : 'red'}}{${MR.toFixed(2)}\\%} $$`;
    const mrElement = document.createElement('p');
    mrElement.innerHTML = `Маржинальная рентабельность (MR): <span class="formula">${mrFormula}</span>`;
    calculationElement.appendChild(mrElement);

    // Точка безубыточности в натуральном выражении (Q)
    const qFormula = `$$ Q = \\frac{FC}{MD} = \\frac{${FC}}{${MD.toFixed(2)}} = ${Q.toFixed(0)} $$`;
    const qElement = document.createElement('p');
    qElement.innerHTML = `Точка безубыточности в натуральном выражении (Q): <span class="formula">${qFormula}</span>`;
    calculationElement.appendChild(qElement);

    // Точка безубыточности в денежном выражении (S)
    const sFormula = `$$ S = \\frac{FC}{MR \\div 100} = \\frac{${FC}}{{${MR.toFixed(2)} \\div 100}} = ${S.toFixed(2)} $$`;
    const sElement = document.createElement('p');
    sElement.innerHTML = `Точка безубыточности в денежном выражении (S): <span class="formula">${sFormula}</span>`;
    calculationElement.appendChild(sElement);

    // Обновление MathJax для отображения формул
    MathJax.typesetPromise();
}

function buildChart(breakevenPoint, fixedCosts, variableCosts, pricePerUnit) {
    const ctx = document.getElementById('breakevenChart').getContext('2d');

    // Генерация данных для графика
    const maxUnits = Math.ceil(breakevenPoint * 1.5);
    const units = [];
    const totalCosts = [];
    const totalRevenue = [];

    const step = Math.ceil(maxUnits / 20) || 1;

    for (let i = 0; i <= maxUnits; i += step) {
        units.push(i);
        totalCosts.push(fixedCosts + variableCosts * i);
        totalRevenue.push(pricePerUnit * i);
    }

    // Удаление предыдущего графика, если он существует
    if (window.breakevenChart) {
        window.breakevenChart.destroy();
    }

    // Создание нового графика
    window.breakevenChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: units,
            datasets: [
                {
                    label: 'Общие затраты',
                    data: totalCosts,
                    borderColor: '#ececec',
                    backgroundColor: 'rgba(236, 236, 236, 0.1)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Общий доход',
                    data: totalRevenue,
                    borderColor: '#b4b4b4',
                    backgroundColor: 'rgba(180, 180, 180, 0.1)',
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ececec'
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: '#2f2f2f',
                    titleColor: '#ececec',
                    bodyColor: '#ececec',
                    borderColor: '#ececec',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Объем продаж (ед.)',
                        color: '#ececec'
                    },
                    ticks: {
                        color: '#ececec'
                    },
                    grid: {
                        color: '#3a3a3a'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Сумма (руб.)',
                        color: '#ececec'
                    },
                    ticks: {
                        color: '#ececec'
                    },
                    grid: {
                        color: '#3a3a3a'
                    }
                }
            }
        }
    });
}
