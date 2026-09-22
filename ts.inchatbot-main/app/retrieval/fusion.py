def reciprocal_rank_fusion(dense_results, sparse_results, k=60):
    """
    Combines dense and sparse retrieval results using Reciprocal Rank Fusion.
    """
    rrf_scores = {}
    
    # Process dense results
    for rank, doc in enumerate(dense_results):
        doc_id = doc.id
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + 1.0 / (k + rank + 1)
        
    # Process sparse results
    for rank, doc in enumerate(sparse_results):
        # Assuming doc is a dict with an 'id' field, needs standardizing based on actual return formats
        doc_id = doc.get("id") or str(rank) # Placeholder
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + 1.0 / (k + rank + 1)
        
    # Sort by RRF score
    sorted_docs = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_docs
