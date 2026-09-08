<template>
  <div class="app-container page-section">

    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3"
    >
      <div>
        <h1>
          Shared Notes
        </h1>

        <p class="text-muted-app mb-0">
          Fresh writing from the whole community.
        </p>
      </div>

      <BaseSearch
        v-model="searchTerm"
        placeholder="Search notes or users..."
        @search="search"
      />
    </div>


    <BaseAlert
      :message="store.error"
      variant="danger"
    />


    <BaseLoader
      v-if="store.isLoading"
      label="Loading posts..."
    />


    <EmptyState
      v-else-if="!store.posts.length"
      icon="bi-journal-x"
      title="No posts found"
      description="Try a different search, or be the first to publish something."
    />


    <div
      v-else
      class="row g-4"
    >
      <div
        v-for="post in store.posts"
        :key="post._id"
        class="col-12 col-sm-6 col-lg-4"
      >
        <PostCard :post="post" />
      </div>
    </div>


    <div class="mt-5">
      <BasePagination
        :page="store.pagination.page"
        :total-pages="store.pagination.totalPages"
        @change="changePage"
      />
    </div>

  </div>
</template>


<script setup>
import { onMounted, ref, watch } from "vue";
import { usePostStore } from "../store/post";

import PostCard from "../components/blog/PostCard.vue";
import BaseAlert from "../components/common/BaseAlert.vue";
import BaseLoader from "../components/common/BaseLoader.vue";
import BasePagination from "../components/common/BasePagination.vue";
import BaseSearch from "../components/common/BaseSearch.vue";
import EmptyState from "../components/common/EmptyState.vue";

const store = usePostStore();

const searchTerm = ref("");

const load = (page = 1) => {
  return store.fetchPosts({
    page,
    limit: 9,
    search: searchTerm.value.trim() || undefined,
  });
};

const search = () => {
  load(1);
};

watch(searchTerm, (value) => {
  if (!value.trim()) {
    load(1);
  }
});

const changePage = (page) => {
  if (
    page < 1 ||
    page > store.pagination.totalPages
  ) {
    return;
  }

  load(page);
};

onMounted(() => {
  load();
});
</script>