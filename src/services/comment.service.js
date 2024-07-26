'use strict'

const Comment = require('../models/comment.model')

/* 
key feature: 
1. add comment
2. get list of comments(User, Shop)
3. delete a comment(User, Shop, Admin)
*/

class CommentService {
    static async createComment({
        productId, userId, content, parentCommentId = null
    }) {
        const newComment = Comment.create({
            comment_productId: productId,
            comment_userId: userId,
            comment_content: content,
            comment_parentId: parentCommentId,
        })

        let rightValue
        if(parentCommentId) {

        } else {
            
        }
    }
}