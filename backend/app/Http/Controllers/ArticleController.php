<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Article;

class ArticleController extends Controller
{
    // 1. GET /api/articles - Fetch all articles
    public function index()
    {
        return Article::orderBy('created_at', 'desc')->get();
    }

    // 2. POST /api/articles - Store a scraped article
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'original_url' => 'nullable|url'
        ]);

        $article = Article::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'original_url' => $validated['original_url'] ?? null,
            'status' => 'original'
        ]);

        return response()->json($article, 201);
    }

    // 3. PUT /api/articles/{id} - Update article with LLM content
    public function update(Request $request, $id)
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json(['message' => 'Article not found'], 404);
        }

        $article->update([
            'content' => $request->input('content'),
            'status' => 'updated'
        ]);

        return response()->json($article);
    }

    // 4. GET /api/articles/latest - Get the one we want to process
    public function getLatest()
    {
        $article = Article::where('status', 'original')->latest()->first();
        return response()->json($article);
    }
}