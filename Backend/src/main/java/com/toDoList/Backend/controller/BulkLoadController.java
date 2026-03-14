package com.toDoList.Backend.controller;

import com.toDoList.Backend.dto.BulkLoadDTO;
import com.toDoList.Backend.service.BulkLoadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bulk-load")
public class BulkLoadController {

    @Autowired
    private BulkLoadService bulkLoadService;

    @PostMapping
    public ResponseEntity<String> bulkLoad(@RequestBody BulkLoadDTO bulkData) {
        try {
            String result = bulkLoadService.processBulkLoad(bulkData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error durante la carga masiva: " + e.getMessage());
        }
    }
}
