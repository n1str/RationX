package ru.rationx.financeapp.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ru.rationx.financeapp.models.dto.statistic.StatisticDTO;
import ru.rationx.financeapp.models.transaction.Transaction;
import ru.rationx.financeapp.models.transaction.TransactionType;
import ru.rationx.financeapp.services.StatisticService;
import ru.rationx.financeapp.services.TransactionService;
import ru.rationx.financeapp.utils.PdfGenerator;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Контроллер для предоставления статистических данных и аналитики
 * для отображения на дашборде
 */

@Slf4j
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {
    private final StatisticService statistics;
    private final TransactionService transactionService;
    private final PdfGenerator pdfGenerator;

    @GetMapping
    public ResponseEntity<?> getGeneralStatistics(Principal principal) {
        try {
            log.info("GET /api/statistics - User: {}", principal.getName());

            // Получаем общую статистику
            Map<String, Object> objectMap = statistics.generalStatistic(principal);

            return ResponseEntity.ok(objectMap);
        } catch (Exception e) {
            log.error("Error getting general statistics: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Ошибка при получении статистики: " + e.getMessage()));
        }
    }

    @GetMapping("/by-category")
    public ResponseEntity<?> getStatisticsByCategory(Principal principal) {
        try {
            log.info("GET /api/statistics/by-category - User: {}", principal.getName());

            Map<String, StatisticDTO> byCategory = statistics.getByCategory(principal);

            return ResponseEntity.ok(byCategory);
        } catch (Exception e) {
            log.error("Error getting statistics by category: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Ошибка при получении статистики по категориям: " + e.getMessage()));
        }
    }

    @GetMapping("/by-period")
    public ResponseEntity<?> getStatisticsByPeriod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
            log.info("GET /api/statistics/by-period?start={}&end={} - User: {}", 
                    start.format(formatter), end.format(formatter), auth.getName());
            
            // Заглушка для отладки
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("period", Map.of(
                    "start", start.format(formatter),
                    "end", end.format(formatter)
            ));
            statistics.put("totalIncome", 75000.0);
            statistics.put("totalExpense", 42000.0);
            statistics.put("balance", 33000.0);
            statistics.put("transactionCount", 22);
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error getting statistics by period: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Ошибка при получении статистики по периоду: " + e.getMessage()));
        }
    }

    @GetMapping("/by-type")
    public ResponseEntity<?> getStatisticsByType(@RequestParam TransactionType type) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("GET /api/statistics/by-type?type={} - User: {}", type, auth.getName());
            
            // Заглушка для отладки
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("type", type);
            
            if (type == TransactionType.DEBIT) {
                statistics.put("total", 150000.0);
                statistics.put("average", 25000.0);
                statistics.put("count", 6);
                statistics.put("largestCategory", "Зарплата");
            } else {
                statistics.put("total", 85000.0);
                statistics.put("average", 2500.0);
                statistics.put("count", 34);
                statistics.put("largestCategory", "Покупки");
            }
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error getting statistics by type: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Ошибка при получении статистики по типу: " + e.getMessage()));
        }
    }

    @GetMapping("/last-month")
    public ResponseEntity<?> getLastMonthStatistics() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("GET /api/statistics/last-month - User: {}", auth.getName());
            
            // Заглушка для отладки
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("period", "Последний месяц");
            statistics.put("totalIncome", 45000.0);
            statistics.put("totalExpense", 35000.0);
            statistics.put("balance", 10000.0);
            statistics.put("transactionCount", 18);
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error getting last month statistics: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Ошибка при получении статистики за последний месяц: " + e.getMessage()));
        }
    }

    @GetMapping("/last-year")
    public ResponseEntity<?> getLastYearStatistics() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("GET /api/statistics/last-year - User: {}", auth.getName());
            
            // Заглушка для отладки
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("period", "Последний год");
            statistics.put("totalIncome", 1250000.0);
            statistics.put("totalExpense", 950000.0);
            statistics.put("balance", 300000.0);
            statistics.put("transactionCount", 156);
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error getting last year statistics: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Ошибка при получении статистики за последний год: " + e.getMessage()));
        }
    }

    /**
     * Экспортирует статистику в PDF отчет
     *
     * @param start начальная дата для отчета
     * @param end конечная дата для отчета
     * @return PDF файл со статистикой
     */
    @GetMapping("/export-pdf")
    public ResponseEntity<?> exportToPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            Principal principal) {
        try {
            log.info("GET /api/statistics/export-pdf?start={}&end={} - User: {}", 
                    start.format(DateTimeFormatter.ISO_DATE_TIME), 
                    end.format(DateTimeFormatter.ISO_DATE_TIME), 
                    principal.getName());
            
            // Получаем данные для отчета
            Map<String, Object> generalStats = statistics.generalStatistic(principal);
            Map<String, StatisticDTO> categoryStats = statistics.getByCategory(principal);
            
            // Получаем транзакции за указанный период
            Date startDate = Date.from(start.atZone(ZoneId.systemDefault()).toInstant());
            Date endDate = Date.from(end.atZone(ZoneId.systemDefault()).toInstant());
            List<Transaction> transactions = transactionService.getTransactionsByDateRange(
                    principal.getName(), startDate, endDate);
            
            // Получаем данные по периодам, тут нужно будет доработать метод
            // для получения реальных данных за период
            // Пока используем фиктивные данные для примера
            List<Map<String, Object>> periodStats = statistics.getPeriodStats(principal, startDate, endDate);
            
            // Генерируем PDF
            byte[] pdfBytes = pdfGenerator.generateFinancialReport(
                    generalStats,
                    categoryStats,
                    periodStats,
                    transactions,
                    startDate,
                    endDate
            );
            
            // Формируем имя файла
            String fileName = "finance-report-" + 
                    start.format(DateTimeFormatter.ofPattern("dd-MM-yyyy")) + "-" +
                    end.format(DateTimeFormatter.ofPattern("dd-MM-yyyy")) + ".pdf";
            
            // Настраиваем заголовки для скачивания файла
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .body(pdfBytes);
            
        } catch (Exception e) {
            log.error("Error exporting to PDF: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Ошибка при генерации PDF отчета: " + e.getMessage()));
        }
    }
}
