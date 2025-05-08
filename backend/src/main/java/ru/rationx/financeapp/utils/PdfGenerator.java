package ru.rationx.financeapp.utils;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import ru.rationx.financeapp.models.dto.statistic.StatisticDTO;
import ru.rationx.financeapp.models.transaction.Transaction;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.Map;

/**
 * Утилитарный класс для генерации стилизованных PDF отчетов по финансовой статистике
 */
@Slf4j
@Component
public class PdfGenerator {

    // Путь к шрифту, который будет использоваться в PDF (для поддержки кириллицы)
    private static final String FONT_PATH = "backend/src/main/resources/fonts/arial.ttf";

    // Цвета для стилизации PDF
    private static final BaseColor PRIMARY_COLOR = new BaseColor(25, 118, 210); // Синий
    private static final BaseColor SECONDARY_COLOR = new BaseColor(63, 81, 181); // Индиго
    private static final BaseColor LIGHT_GRAY = new BaseColor(245, 245, 245); // Светло-серый для чередования строк
    private static final BaseColor HEADER_COLOR = new BaseColor(224, 234, 252); // Светло-синий для заголовков
    private static final BaseColor INCOME_COLOR = new BaseColor(76, 175, 80); // Зеленый для доходов
    private static final BaseColor EXPENSE_COLOR = new BaseColor(244, 67, 54); // Красный для расходов

    // Форматы дат и чисел
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("dd.MM.yyyy");
    private static final SimpleDateFormat DATE_TIME_FORMAT = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");
    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("#,##0.00");

    /**
     * Генерирует PDF отчет на основе переданных статистических данных
     *
     * @param generalStats  Общая статистика
     * @param categoryStats Статистика по категориям
     * @param periodStats   Статистика по периодам
     * @param transactions  Список транзакций
     * @param startDate     Начальная дата отчета
     * @param endDate       Конечная дата отчета
     * @return Массив байт сгенерированного PDF документа
     */
    public byte[] generateFinancialReport(
            Map<String, Object> generalStats,
            Map<String, StatisticDTO> categoryStats,
            java.util.List<Map<String, Object>> periodStats,
            java.util.List<Transaction> transactions,
            Date startDate,
            Date endDate) {

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter writer = PdfWriter.getInstance(document, outputStream);

            // Добавляем номера страниц и другие метаданные
            writer.setPageEvent(new PdfPageEventHelper() {
                public void onEndPage(PdfWriter writer, Document document) {
                    PdfContentByte cb = writer.getDirectContent();
                    Phrase phrase = new Phrase(String.format("Страница %d", writer.getPageNumber()),
                            getBaseFont(8, false));

                    // Располагаем номер страницы внизу по центру
                    float x = (document.right() - document.left()) / 2 + document.leftMargin();
                    float y = document.bottom() - 20;

                    ColumnText.showTextAligned(cb, Element.ALIGN_CENTER, phrase, x, y, 0);
                }
            });

            // Устанавливаем поля документа
            document.setMargins(30, 30, 40, 40);
            document.open();

            // Заголовок отчета
            addTitle(document, "Финансовый отчет", startDate, endDate);

            // Раздел общей статистики
            addGeneralStatistics(document, generalStats);

            // Список транзакций
            addTransactionList(document, transactions);

            document.close();
            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Ошибка при создании PDF отчета", e);
            throw new RuntimeException("Не удалось создать PDF отчет: " + e.getMessage(), e);
        }
    }

    /**
     * Добавляет стилизованный заголовок отчета в документ
     */
    private void addTitle(Document document, String title, Date startDate, Date endDate) throws DocumentException {
        // Создаем верхний колонтитул с логотипом или названием приложения
        PdfPTable headerTable = new PdfPTable(1);
        headerTable.setWidthPercentage(100);
        headerTable.setSpacingAfter(15);

        // Создаем ячейку с названием приложения
        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        logoCell.setPadding(10);
        logoCell.setBackgroundColor(PRIMARY_COLOR);

        // Добавляем название приложения
        Paragraph appName = new Paragraph("RationX - Финансовый менеджер", getBaseFont(16, true, BaseColor.WHITE));
        appName.setAlignment(Element.ALIGN_CENTER);
        logoCell.addElement(appName);
        headerTable.addCell(logoCell);
        document.add(headerTable);

        // Добавляем заголовок отчета
        Paragraph titleParagraph = new Paragraph(title, getBaseFont(22, true, PRIMARY_COLOR));
        titleParagraph.setAlignment(Element.ALIGN_CENTER);
        titleParagraph.setSpacingAfter(10);
        document.add(titleParagraph);

        // Добавляем информацию о периоде
        String period = String.format("Период: %s - %s",
                DATE_FORMAT.format(startDate),
                DATE_FORMAT.format(endDate));

        // Создаем таблицу для периода с выделением
        PdfPTable periodTable = new PdfPTable(1);
        periodTable.setWidthPercentage(70);
        periodTable.setHorizontalAlignment(Element.ALIGN_CENTER);
        periodTable.setSpacingAfter(25);

        PdfPCell periodCell = new PdfPCell(new Phrase(period, getBaseFont(12, true)));
        periodCell.setBackgroundColor(LIGHT_GRAY);
        periodCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        periodCell.setPadding(8);
        periodTable.addCell(periodCell);

        document.add(periodTable);

        // Добавляем краткое описание отчета
        Paragraph description = new Paragraph(
                "Данный отчет содержит обзор финансовой активности за выбранный период, включая статистику по доходам, расходам, категориям и транзакциям.",
                getBaseFont(10, false));
        description.setAlignment(Element.ALIGN_JUSTIFIED);
        description.setSpacingAfter(15);
        document.add(description);
    }

    /**
     * Добавляет раздел общей статистики с улучшенным дизайном
     */
    private void addGeneralStatistics(Document document, Map<String, Object> generalStats) throws DocumentException {
        // Создаем заголовок раздела в стилизованной таблице
        PdfPTable sectionHeaderTable = new PdfPTable(1);
        sectionHeaderTable.setWidthPercentage(100);
        sectionHeaderTable.setSpacingBefore(15);
        sectionHeaderTable.setSpacingAfter(10);

        PdfPCell sectionHeaderCell = new PdfPCell();
        sectionHeaderCell.setPadding(8);
        sectionHeaderCell.setBackgroundColor(PRIMARY_COLOR);

        Paragraph sectionTitle = new Paragraph("Общие финансовые показатели", getBaseFont(14, true, BaseColor.WHITE));
        sectionTitle.setAlignment(Element.ALIGN_CENTER);
        sectionHeaderCell.addElement(sectionTitle);

        sectionHeaderTable.addCell(sectionHeaderCell);
        document.add(sectionHeaderTable);

        // Создаем основные показатели в двух колонках
        PdfPTable summaryTable = new PdfPTable(2);
        summaryTable.setWidthPercentage(90);
        summaryTable.setSpacingBefore(5f);
        summaryTable.setSpacingAfter(15f);
        summaryTable.setHorizontalAlignment(Element.ALIGN_CENTER);

        // Получаем значения статистики, обрабатываем возможные варианты имен полей
        double balance = generalStats.containsKey("balance")
                ? ((Number) generalStats.get("balance")).doubleValue() : 0.0;

        double totalIncome = generalStats.containsKey("totalIncome")
                ? ((Number) generalStats.get("totalIncome")).doubleValue()
                : (generalStats.containsKey("income") ? ((Number) generalStats.get("income")).doubleValue() : 0.0);

        double totalExpenses = generalStats.containsKey("totalExpense")
                ? ((Number) generalStats.get("totalExpense")).doubleValue()
                : (generalStats.containsKey("expenses") ? ((Number) generalStats.get("expenses")).doubleValue() : 0.0);

        int transactionCount = generalStats.containsKey("transactionCount")
                ? ((Number) generalStats.get("transactionCount")).intValue() : 0;

        // Дополнительные статистические данные, которые могут отсутствовать
        double avgTransaction = generalStats.containsKey("averageTransaction")
                ? ((Number) generalStats.get("averageTransaction")).doubleValue() : 0.0;

        double largestIncome = generalStats.containsKey("largestIncome")
                ? ((Number) generalStats.get("largestIncome")).doubleValue() : 0.0;

        double largestExpense = generalStats.containsKey("largestExpense")
                ? ((Number) generalStats.get("largestExpense")).doubleValue() : 0.0;

        // Пояснение к основным показателям
        Paragraph infoText = new Paragraph(
                "Основные финансовые показатели за выбранный период. Баланс рассчитывается как сумма доходов минус сумма расходов.",
                getBaseFont(9, false)
        );
        infoText.setAlignment(Element.ALIGN_JUSTIFIED);
        infoText.setSpacingBefore(5);
        infoText.setSpacingAfter(10);
        document.add(infoText);

        // Создаем красивые ячейки для основных показателей
        // 1. Баланс (разница между доходами и расходами)

        double shit = totalExpenses - totalIncome;
        addKeyValueCell(summaryTable, "Общий баланс (доходы - расходы)", formatCurrency(shit), shit >= 0 ? INCOME_COLOR : EXPENSE_COLOR);

        // 2. Общий доход (DEBIT транзакции)
        addKeyValueCell(summaryTable, "Сумма всех доходов (DEBIT)", formatCurrency(totalExpenses), INCOME_COLOR);

        // 3. Общие расходы (CREDIT транзакции)
        addKeyValueCell(summaryTable, "Сумма всех расходов (CREDIT)", formatCurrency(totalIncome), EXPENSE_COLOR);

        // 4. Всего транзакций за период
        addKeyValueCell(summaryTable, "Количество транзакций за период", String.valueOf(transactionCount), PRIMARY_COLOR);

        // Добавляем таблицу с основными показателями
        document.add(summaryTable);

    }

    /**
     * Добавляет ячейку с ключом и значением в стилизованном виде
     */
    private void addKeyValueCell(PdfPTable table, String key, String value, BaseColor valueColor) throws DocumentException {
        // Создаем ячейку для ключа (названия показателя)
        PdfPCell keyCell = new PdfPCell();
        keyCell.setPadding(10);
        keyCell.setBackgroundColor(HEADER_COLOR);
        keyCell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph keyPara = new Paragraph(key, getBaseFont(12, true));
        keyPara.setAlignment(Element.ALIGN_CENTER);
        keyCell.addElement(keyPara);
        table.addCell(keyCell);

        // Создаем ячейку для значения
        PdfPCell valueCell = new PdfPCell();
        valueCell.setPadding(10);
        valueCell.setBackgroundColor(LIGHT_GRAY);
        valueCell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph valuePara = new Paragraph(value, getBaseFont(12, true, valueColor));
        valuePara.setAlignment(Element.ALIGN_CENTER);
        valueCell.addElement(valuePara);
        table.addCell(valueCell);
    }

    /**
     * Добавляет раздел статистики по категориям с улучшенным форматированием
     */
    private void addCategoryStatistics(Document document, Map<String, StatisticDTO> categoryStats) throws DocumentException {
        // Создаем заголовок раздела
        PdfPTable sectionHeaderTable = new PdfPTable(1);
        sectionHeaderTable.setWidthPercentage(100);
        sectionHeaderTable.setSpacingBefore(20);
        sectionHeaderTable.setSpacingAfter(10);

        PdfPCell sectionHeaderCell = new PdfPCell();
        sectionHeaderCell.setPadding(8);
        sectionHeaderCell.setBackgroundColor(PRIMARY_COLOR);

        Paragraph sectionTitle = new Paragraph("Статистика по категориям", getBaseFont(14, true, BaseColor.WHITE));
        sectionTitle.setAlignment(Element.ALIGN_CENTER);
        sectionHeaderCell.addElement(sectionTitle);

        sectionHeaderTable.addCell(sectionHeaderCell);
        document.add(sectionHeaderTable);

        // Подробное описание раздела
        Paragraph description = new Paragraph(
                "В этой таблице представлены данные о доходах (DEBIT) и расходах (CREDIT) по каждой категории.",
                getBaseFont(10, false));
        description.setAlignment(Element.ALIGN_JUSTIFIED);
        description.setSpacingAfter(10);
        document.add(description);

        // Создаем таблицу для данных
        PdfPTable table = new PdfPTable(3);
        float[] columnWidths = {3f, 1.5f, 2f}; // Разная ширина столбцов
        table.setWidths(columnWidths);
        table.setWidthPercentage(100);
        table.setSpacingBefore(5f);
        table.setSpacingAfter(15f);

        // Шапка таблицы
        addTableHeader(table, new String[]{"Категория", "Тип", "Сумма"});

        // Добавляем строки с данными из Map
        if (categoryStats != null && !categoryStats.isEmpty()) {
            // Сортируем категории по сумме (по убыванию) для лучшего представления
            java.util.List<Map.Entry<String, StatisticDTO>> entries = new ArrayList<>(categoryStats.entrySet());
            entries.sort((e1, e2) -> Double.compare(e2.getValue().getSum(), e1.getValue().getSum()));

            // Добавляем строки в таблицу
            int rowNum = 0;
            for (Map.Entry<String, StatisticDTO> entry : entries) {
                StatisticDTO stat = entry.getValue();
                String categoryName = entry.getKey();
                String type = getTransactionTypeText(stat.getType());
                double amount = stat.getSum();

                // Чередуем цвета строк для улучшения читаемости
                BaseColor rowColor = (rowNum % 2 == 0) ? BaseColor.WHITE : LIGHT_GRAY;
                BaseColor textColor = "DEBIT".equals(stat.getType()) ? INCOME_COLOR : EXPENSE_COLOR;

                // Добавляем стилизованную строку
                addStyledTableRow(table, rowColor, textColor,
                        categoryName,
                        type,
                        formatCurrency(amount)
                );

                rowNum++;
            }
        } else {
            PdfPCell cell = new PdfPCell(new Phrase("Нет данных для отображения", getBaseFont(10, true)));
            cell.setColspan(3);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(15);
            cell.setBackgroundColor(LIGHT_GRAY);
            table.addCell(cell);
        }

        document.add(table);
    }

    /**
     * Добавляет стилизованную строку в таблицу
     */
    private void addStyledTableRow(PdfPTable table, BaseColor rowColor, BaseColor textColor, String... values) {
        for (String value : values) {
            PdfPCell cell = new PdfPCell(new Phrase(value, getBaseFont(10, false, textColor)));
            cell.setPadding(7);
            cell.setBackgroundColor(rowColor);
            table.addCell(cell);
        }
    }

    /**
     * Добавляет раздел статистики по периодам
     */
    private void addPeriodStatistics(Document document, java.util.List<Map<String, Object>> periodStats) throws DocumentException {
        // Создаем заголовок раздела
        PdfPTable sectionHeaderTable = new PdfPTable(1);
        sectionHeaderTable.setWidthPercentage(100);
        sectionHeaderTable.setSpacingBefore(20);
        sectionHeaderTable.setSpacingAfter(10);

        PdfPCell sectionHeaderCell = new PdfPCell();
        sectionHeaderCell.setPadding(8);
        sectionHeaderCell.setBackgroundColor(PRIMARY_COLOR);

        Paragraph sectionTitle = new Paragraph("Статистика по периодам", getBaseFont(14, true, BaseColor.WHITE));
        sectionTitle.setAlignment(Element.ALIGN_CENTER);
        sectionHeaderCell.addElement(sectionTitle);

        sectionHeaderTable.addCell(sectionHeaderCell);
        document.add(sectionHeaderTable);

        // Создаем таблицу для данных
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);
        table.setSpacingAfter(10f);

        // Шапка таблицы
        addTableHeader(table, new String[]{"Период", "Доходы", "Расходы", "Баланс", "Транзакций"});

        // Добавляем строки с данными
        if (periodStats != null && !periodStats.isEmpty()) {
            int rowNum = 0;
            for (Map<String, Object> period : periodStats) {
                String periodDate = "Н/Д";
                try {
                    if (period.get("period") != null) {
                        if (period.get("period") instanceof Date) {
                            periodDate = DATE_FORMAT.format((Date) period.get("period"));
                        } else if (period.get("period") instanceof String) {
                            periodDate = (String) period.get("period");
                        }
                    }
                } catch (Exception e) {
                    log.error("Ошибка форматирования даты", e);
                }

                double income = period.containsKey("income") ? ((Number) period.get("expenses")).doubleValue() : 0.0;
                double expenses = period.containsKey("expenses") ? ((Number) period.get("income")).doubleValue() : 0.0;
                double balance = ((Number) period.get("income")).doubleValue() - ((Number) period.get("expenses")).doubleValue();
                int count = period.containsKey("transactionCount") ? ((Number) period.get("transactionCount")).intValue() : 0;

                // Чередуем цвета строк для улучшения читаемости
                BaseColor rowColor = (rowNum % 2 == 0) ? BaseColor.WHITE : LIGHT_GRAY;

                // Добавляем строку в таблицу
                PdfPCell periodCell = new PdfPCell(new Phrase(periodDate, getBaseFont(10, false)));
                periodCell.setBackgroundColor(rowColor);
                periodCell.setPadding(5);
                table.addCell(periodCell);

                PdfPCell incomeCell = new PdfPCell(new Phrase(formatCurrency(income), getBaseFont(10, false, INCOME_COLOR)));
                incomeCell.setBackgroundColor(rowColor);
                incomeCell.setPadding(5);
                incomeCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(incomeCell);

                PdfPCell expensesCell = new PdfPCell(new Phrase(formatCurrency(expenses), getBaseFont(10, false, EXPENSE_COLOR)));
                expensesCell.setBackgroundColor(rowColor);
                expensesCell.setPadding(5);
                expensesCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(expensesCell);

                PdfPCell balanceCell = new PdfPCell(new Phrase(formatCurrency(balance),
                        getBaseFont(10, false, balance >= 0 ? INCOME_COLOR : EXPENSE_COLOR)));
                balanceCell.setBackgroundColor(rowColor);
                balanceCell.setPadding(5);
                balanceCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(balanceCell);

                PdfPCell countCell = new PdfPCell(new Phrase(String.valueOf(count), getBaseFont(10, false)));
                countCell.setBackgroundColor(rowColor);
                countCell.setPadding(5);
                countCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(countCell);

                rowNum++;
            }
        } else {
            PdfPCell cell = new PdfPCell(new Phrase("Нет данных для отображения", getBaseFont(10, false)));
            cell.setColspan(5);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(10);
            table.addCell(cell);
        }

        document.add(table);
    }

    /**
     * Добавляет список транзакций с улучшенным форматированием
     */
    private void addTransactionList(Document document, java.util.List<Transaction> transactions) throws DocumentException {
        // Добавляем разрыв страницы
        document.newPage();

        // Создаем заголовок раздела
        PdfPTable sectionHeaderTable = new PdfPTable(1);
        sectionHeaderTable.setWidthPercentage(100);
        sectionHeaderTable.setSpacingBefore(15);
        sectionHeaderTable.setSpacingAfter(10);

        PdfPCell sectionHeaderCell = new PdfPCell();
        sectionHeaderCell.setPadding(8);
        sectionHeaderCell.setBackgroundColor(PRIMARY_COLOR);

        Paragraph sectionTitle = new Paragraph("Детальный список транзакций за период", getBaseFont(14, true, BaseColor.WHITE));
        sectionTitle.setAlignment(Element.ALIGN_CENTER);
        sectionHeaderCell.addElement(sectionTitle);

        sectionHeaderTable.addCell(sectionHeaderCell);
        document.add(sectionHeaderTable);

        // Пояснение к разделу
        Paragraph description = new Paragraph(
                "В таблице ниже представлены все транзакции за выбранный период. "
                        + "Доходные транзакции (DEBIT) выделены зеленым цветом, расходные (CREDIT) - красным.",
                getBaseFont(10, false)
        );
        description.setAlignment(Element.ALIGN_JUSTIFIED);
        description.setSpacingAfter(10);
        document.add(description);

        // Создаем таблицу для списка транзакций
        PdfPTable table = new PdfPTable(6);
        float[] columnWidths = {0.7f, 1.3f, 1.5f, 1.5f, 1.5f, 2.5f};
        table.setWidths(columnWidths);
        table.setWidthPercentage(100);
        table.setSpacingBefore(5f);
        table.setSpacingAfter(15f);

        // Шапка таблицы
        addTableHeader(table, new String[]{
                "ID",
                "Дата",
                "Тип",
                "Сумма",
                "Категория",
                "Комментарий"
        });

        // Добавляем строки с данными
        if (transactions != null && !transactions.isEmpty()) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
            int rowNum = 0;

            for (Transaction tx : transactions) {
                // Проверяем наличие всех необходимых данных в транзакции
                if (tx.getRegTransaction() == null) {
                    log.warn("Транзакция с ID {} не имеет связанного RegTransaction", tx.getId());
                    continue;
                }

                // Получаем данные о транзакции
                String date = tx.getDateTime() != null ?
                        tx.getDateTime().format(formatter) : "Н/Д";

                String typeCode = tx.getRegTransaction().getTransactionType().toString();
                String type = getTransactionTypeText(typeCode);
                String category = tx.getCategory() != null ? tx.getCategory().getName() : "Без категории";
                double amount = tx.getRegTransaction().getSum();

                // Чередуем цвета строк для улучшения читаемости
                BaseColor rowColor = (rowNum % 2 == 0) ? BaseColor.WHITE : LIGHT_GRAY;
                BaseColor textColor = "CREDIT".equals(typeCode) ? INCOME_COLOR : EXPENSE_COLOR;

                // ID
                PdfPCell idCell = new PdfPCell(new Phrase(String.valueOf(tx.getId()), getBaseFont(10, false)));
                idCell.setBackgroundColor(rowColor);
                idCell.setPadding(5);
                idCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(idCell);

                // Дата
                PdfPCell dateCell = new PdfPCell(new Phrase(date, getBaseFont(10, false)));
                dateCell.setBackgroundColor(rowColor);
                dateCell.setPadding(5);
                table.addCell(dateCell);

                // Тип операции
                PdfPCell typeCell = new PdfPCell(new Phrase(type, getBaseFont(10, false, textColor)));
                typeCell.setBackgroundColor(rowColor);
                typeCell.setPadding(5);
                table.addCell(typeCell);

                // Сумма
                PdfPCell amountCell = new PdfPCell(new Phrase(formatCurrency(amount), getBaseFont(10, false, textColor)));
                amountCell.setBackgroundColor(rowColor);
                amountCell.setPadding(5);
                amountCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(amountCell);

                // Категория
                PdfPCell categoryCell = new PdfPCell(new Phrase(category, getBaseFont(10, false)));
                categoryCell.setBackgroundColor(rowColor);
                categoryCell.setPadding(5);
                table.addCell(categoryCell);

                // Комментарий
                PdfPCell commentCell = new PdfPCell(new Phrase(tx.getComment() != null ? tx.getComment() : "", getBaseFont(10, false)));
                commentCell.setBackgroundColor(rowColor);
                commentCell.setPadding(5);
                table.addCell(commentCell);

                rowNum++;
            }
        } else {
            PdfPCell cell = new PdfPCell(new Phrase("Нет транзакций за выбранный период", getBaseFont(10, true)));
            cell.setColspan(6);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(15);
            cell.setBackgroundColor(LIGHT_GRAY);
            table.addCell(cell);
        }

        document.add(table);

        // Добавляем футер с пояснением и датой генерации
        PdfPTable footerTable = new PdfPTable(1);
        footerTable.setWidthPercentage(100);
        footerTable.setSpacingBefore(20);

        PdfPCell footerCell = new PdfPCell();
        footerCell.setBorder(Rectangle.NO_BORDER);
        footerCell.setPadding(5);

        Paragraph legend = new Paragraph(
                "Примечание: В системе RationX тип DEBIT означает доход, CREDIT - расход.",
                getBaseFont(9, true));
        legend.setAlignment(Element.ALIGN_CENTER);
        footerCell.addElement(legend);

        Paragraph footer = new Paragraph(
                "Отчет сгенерирован: " + DATE_TIME_FORMAT.format(new Date()),
                getBaseFont(8, false));
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(10);
        footerCell.addElement(footer);

        footerTable.addCell(footerCell);
        document.add(footerTable);
    }

    /**
     * Добавляет заголовок таблицы
     */
    private void addTableHeader(PdfPTable table, String[] headers) {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, getBaseFont(10, true)));
            cell.setBackgroundColor(new BaseColor(240, 240, 240));
            cell.setPadding(5);
            table.addCell(cell);
        }
    }

    /**
     * Добавляет строку в таблицу
     */
    private void addTableRow(PdfPTable table, String... values) {
        for (String value : values) {
            PdfPCell cell = new PdfPCell(new Phrase(value, getBaseFont(10, false)));
            cell.setPadding(5);
            table.addCell(cell);
        }
    }

    /**
     * Форматирует числовое значение как валюту с двумя знаками после запятой
     */
    private String formatCurrency(Double amount) {
        if (amount == null) {
            return "0.00 ₽";
        }
        return String.format("%,.2f ₽", amount);
    }

    /**
     * Форматирует числовое значение как валюту без копеек, для больших сумм
     */
    private String formatCurrencyShort(Double amount) {
        if (amount == null) {
            return "0 ₽";
        }
        return String.format("%,.0f ₽", amount);
    }

    /**
     * Преобразует тип транзакции в читаемый текст
     */
    private String getTransactionTypeText(String type) {
        if ("CREDIT".equals(type)) return "Доход";
        if ("DEBIT".equals(type)) return "Расход";
        return type;
    }

    /**
     * Возвращает шрифт с поддержкой кириллицы
     */
    private Font getBaseFont(int size, boolean bold) {
        return getBaseFont(size, bold, null);
    }

    /**
     * Возвращает шрифт с поддержкой кириллицы и указанным цветом
     */
    private Font getBaseFont(int size, boolean bold, BaseColor color) {
        try {
            // Load font as a resource from classpath
            String fontPath = "/fonts/arial.ttf"; // Note the leading slash
            InputStream fontStream = getClass().getResourceAsStream(fontPath);

            if (fontStream == null) {
                throw new IOException("Font file not found: " + fontPath);
            }

            // Create base font with proper encoding
            BaseFont baseFont = BaseFont.createFont(
                    "arial.ttf",
                    BaseFont.IDENTITY_H,
                    BaseFont.EMBEDDED,
                    BaseFont.CACHED,
                    fontStream.readAllBytes(),
                    null
            );
            fontStream.close();

            Font font = new Font(baseFont, size);

            if (bold) {
                font.setStyle(Font.BOLD);
            }

            if (color != null) {
                font.setColor(color);
            }

            return font;
        } catch (Exception e) {
            log.error("Ошибка при загрузке шрифта", e);
            // Fallback to a font that supports Cyrillic
            try {
                BaseFont baseFont = BaseFont.createFont(
                        "c:/windows/fonts/arial.ttf",  // Try Windows path
                        BaseFont.IDENTITY_H,
                        BaseFont.EMBEDDED
                );
                Font font = new Font(baseFont, size);
                if (bold) font.setStyle(Font.BOLD);
                if (color != null) font.setColor(color);
                return font;
            } catch (Exception ex) {
                log.error("Ошибка при загрузке fallback шрифта", ex);
                // Ultimate fallback - may not support Cyrillic
                Font font = new Font(Font.FontFamily.HELVETICA, size);
                if (bold) font.setStyle(Font.BOLD);
                if (color != null) font.setColor(color);
                return font;
            }
        }
    }
}