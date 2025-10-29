package com.carrie.hazellabev2.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carrie.hazellabev2.entities.Blog;
import com.carrie.hazellabev2.services.BlogService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/blogs")

public class BlogRestController {
    @Autowired
    private BlogService blogService;
    
    @PostMapping
    public ResponseEntity<Blog> crearBlog(@RequestBody Blog blog) {
        Blog nuevoBlog = blogService.crear(blog);
        return ResponseEntity.ok(nuevoBlog);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Blog> obtenerBlogPorId(@PathVariable Long id) {
        Blog blog = blogService.obtenerPorID(id);
        return ResponseEntity.ok(blog);
    }
  
    @PutMapping("/{id}")
    public ResponseEntity<Blog> actualizarBlog(@PathVariable Long id, @RequestBody Blog blogActualizado) {
        Blog blog = blogService.actualizar(id, blogActualizado);
        return ResponseEntity.ok(blog);
    }

    @GetMapping
    public ResponseEntity<List<Blog>> listarBlogs() {
        List<Blog> blogs = blogService.listarTodo();
        return ResponseEntity.ok(blogs);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarBlog(@PathVariable Long id) {
        blogService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
