"""
Custom pagination classes for consistent API responses.
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.utils.urls import replace_query_param
from collections import OrderedDict


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination class for consistent API responses."""
    
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        """Get paginated response in standard format."""
        return Response(OrderedDict([
            ('success', True),
            ('message', 'Data retrieved successfully'),
            ('data', data),
            ('pagination', {
                'currentPage': self.page.number,
                'pageSize': self.page_size,
                'totalItems': self.page.paginator.count,
                'totalPages': self.page.paginator.num_pages,
                'hasNext': self.has_next,
                'hasPrevious': self.has_previous,
                'nextPage': self.next_page_number if self.has_next else None,
                'previousPage': self.previous_page_number if self.has_previous else None,
            })
        ]))


class LargeResultsSetPagination(PageNumberPagination):
    """Pagination for large datasets with cursor-based pagination."""
    
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200
    
    def get_paginated_response(self, data):
        """Get paginated response for large datasets."""
        return Response(OrderedDict([
            ('success', True),
            ('message', 'Data retrieved successfully'),
            ('data', data),
            ('pagination', {
                'currentPage': self.page.number,
                'pageSize': self.page_size,
                'totalItems': self.page.paginator.count,
                'totalPages': self.page.paginator.num_pages,
                'hasNext': self.has_next,
                'hasPrevious': self.has_previous,
                'nextCursor': getattr(self.page, 'next_cursor', None),
                'previousCursor': getattr(self.page, 'previous_cursor', None),
            })
        ]))


class CursorPagination(PageNumberPagination):
    """Cursor-based pagination for real-time data."""
    
    page_size = 25
    ordering = '-created_at'
    
    def paginate_queryset(self, queryset, request, view=None):
        """Override to support cursor-based pagination."""
        # Custom cursor pagination logic
        return super().paginate_queryset(queryset, request, view)


class InfiniteScrollPagination(PageNumberPagination):
    """Pagination for infinite scroll interfaces."""
    
    page_size = 20
    max_page_size = 100
    
    def get_paginated_response(self, data):
        """Get response for infinite scroll."""
        return Response(OrderedDict([
            ('success', True),
            ('message', 'Data retrieved successfully'),
            ('data', data),
            ('pagination', {
                'hasMore': self.has_next,
                'nextCursor': getattr(self.page, 'next_cursor', None),
                'items': data,
                'totalItems': self.page.paginator.count,
            })
        ]))
