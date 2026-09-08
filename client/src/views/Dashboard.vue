<template>
  <div class="app-container page-section">

    <!-- ==========================================================
         PAGE HEADER
         ========================================================== -->

    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3"
    >
      <h1 class="mb-0">
        My Notebook
      </h1>

      <BaseButton
        to="/posts/new"
        icon="bi-plus-circle"
      >
        New Note
      </BaseButton>
    </div>


    <!-- ==========================================================
         SEARCH
         ========================================================== -->

    <div class="mb-4 d-flex justify-content-end">
      <BaseSearch
        v-model="searchTerm"
        placeholder="Search your posts..."
        @search="search"
      />
    </div>


    <!-- ==========================================================
         LOADING
         ========================================================== -->

    <BaseLoader
      v-if="loading"
      label="Loading your posts..."
    />


    <!-- ==========================================================
         EMPTY STATE
         ========================================================== -->

    <EmptyState
      v-else-if="!myPosts.length"
      icon="bi-journal-plus"
      title="You haven't written anything yet"
      description="Your published and draft posts will show up here."
    >
      <BaseButton
        variant="primary"
        @click="$router.push('/posts/new')"
      >
        Write your first note
      </BaseButton>
    </EmptyState>


    <!-- ==========================================================
         POSTS
         ========================================================== -->

    <template v-else>

      <div class="table-responsive dashboard-table__responsive">
        <table class="dashboard-table">

          <thead class="dashboard-table__head">
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Created</th>
              <th class="dashboard-table__actions-heading">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>

            <tr
              v-for="post in myPosts"
              :key="post._id"
              class="dashboard-table__row"
            >

              <!-- Title -->

              <td class="dashboard-table__title">
                <router-link
                  :to="`/posts/${post.slug}`"
                  class="dashboard-table__title-link"
                >
                  {{ post.title }}
                </router-link>
              </td>


              <!-- Status -->

              <td>
                <span
                  class="dashboard-table__status"
                  :class="
                    post.status === 'published'
                      ? 'dashboard-table__status--published'
                      : 'dashboard-table__status--draft'
                  "
                >
                  {{ post.status }}
                </span>
              </td>


              <!-- Created -->

              <td class="dashboard-table__date">
                {{ formatDate(post.createdAt) }}
              </td>


              <!-- Actions -->

              <td class="dashboard-table__actions">
                <div class="dashboard-actions">

                  <BaseButton
                    :to="`/posts/${post.slug}/edit`"
                    variant="outline"
                    size="sm"
                    icon="bi-pencil"
                    aria-label="Edit post"
                  >
                    Edit
                  </BaseButton>

                  <BaseButton
                    variant="danger"
                    size="sm"
                    icon="bi-trash"
                    aria-label="Delete post"
                    @click="confirmDelete(post.slug)"
                  />

                </div>
              </td>

            </tr>

          </tbody>
        </table>
      </div>


      <!-- ========================================================
           PAGINATION
           ======================================================== -->

      <div class="mt-4">
        <BasePagination
          :page="pagination.page"
          :total-pages="pagination.totalPages"
          @change="changePage"
        />
      </div>

    </template>


    <!-- ==========================================================
         DELETE MODAL
         ========================================================== -->

    <ConfirmModal
      id="dashboardDeleteModal"
      ref="confirmModal"
      title="Delete this post?"
      message="This action is permanent and cannot be undone."
      @confirm="handleDelete"
    />

  </div>
</template>


<script setup>
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { postService } from "../services/post";
import { usePostStore } from "../store/post";

import BaseButton from "../components/common/BaseButton.vue";
import BaseLoader from "../components/common/BaseLoader.vue";
import BaseSearch from "../components/common/BaseSearch.vue";
import BasePagination from "../components/common/BasePagination.vue";
import EmptyState from "../components/common/EmptyState.vue";
import ConfirmModal from "../components/common/ConfirmModal.vue";


const router = useRouter();
const store = usePostStore();

const myPosts = ref([]);
const loading = ref(true);

const searchTerm = ref("");

const pagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
});

const confirmModal = ref(null);
const pendingSlug = ref(null);


// ================================================================
// DATE
// ================================================================

const formatDate = (date) => {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};


// ================================================================
// LOAD
// ================================================================

const load = async (page = 1) => {
  loading.value = true;

  try {
    const res = await postService.getMyPosts({
      page,
      search: searchTerm.value.trim() || undefined,
    });

    myPosts.value = res.data.posts;
    pagination.value = res.data.pagination;
  } finally {
    loading.value = false;
  }
};


// ================================================================
// SEARCH
// ================================================================

const search = () => {
  load(1);
};


// Clear search → restore all posts

watch(searchTerm, (value) => {
  if (!value.trim()) {
    load(1);
  }
});


// ================================================================
// PAGINATION
// ================================================================

const changePage = (page) => {
  if (
    page < 1 ||
    page > pagination.value.totalPages
  ) {
    return;
  }

  load(page);
};


// ================================================================
// DELETE
// ================================================================

const confirmDelete = (slug) => {
  pendingSlug.value = slug;

  confirmModal.value?.show();
};


const handleDelete = async () => {
  if (!pendingSlug.value) {
    return;
  }

  const slug = pendingSlug.value;

  await store.deletePost(slug);

  myPosts.value = myPosts.value.filter(
    (post) => post.slug !== slug
  );

  pendingSlug.value = null;

  // If deleting the final item on a page leaves that page
  // empty, move back to the previous page.

  if (
    !myPosts.value.length &&
    pagination.value.page > 1
  ) {
    await load(pagination.value.page - 1);
  }
};


// ================================================================
// NAVIGATION
// ================================================================

const goToNewPost = () => {
  router.push("/posts/new");
};


const goToEditPost = (slug) => {
  router.push(`/posts/${slug}/edit`);
};


onMounted(load);
</script>


<style scoped>
/* ================================================================
   TABLE
   ================================================================ */

.dashboard-table__responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.dashboard-table {
  width: 100%;
  min-width: 650px;
  margin: 0;

  border-collapse: collapse;

  background: var(--color-surface);
  color: var(--color-text);

  font-size: var(--fs-sm);
}


/* ================================================================
   TABLE HEADER
   ================================================================ */

.dashboard-table__head {
  background: var(--color-surface-alt);
}

.dashboard-table__head th {
  padding: var(--space-3) var(--space-4);

  border-bottom: var(--border-width) solid var(--color-border);

  color: var(--color-text-muted);

  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-normal);

  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  white-space: nowrap;
}


/* ================================================================
   TABLE ROWS
   ================================================================ */

.dashboard-table__row {
  transition: background-color var(--transition-fast);
}

.dashboard-table__row:not(:last-child) td {
  border-bottom: var(--border-width) solid var(--color-border);
}

.dashboard-table__row:hover {
  background: var(--color-surface-alt);
}

.dashboard-table td {
  padding: var(--space-4);
  vertical-align: middle;
}


/* ================================================================
   TITLE
   ================================================================ */

.dashboard-table__title {
  min-width: 220px;
  font-weight: var(--fw-medium);
}

.dashboard-table__title-link {
  color: var(--color-text);
  font-weight: var(--fw-medium);
  text-decoration: none;
}

.dashboard-table__title-link:hover {
  color: var(--color-primary);
}


/* ================================================================
   STATUS
   ================================================================ */

.dashboard-table__status {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 1.75rem;

  padding: 0 var(--space-3);

  border-radius: var(--radius-pill);

  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  line-height: 1;

  text-transform: capitalize;
  white-space: nowrap;
}

.dashboard-table__status--published {
  background: var(--color-primary-lighter);
  color: var(--color-primary);
}

.dashboard-table__status--draft {
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
}


/* ================================================================
   DATE
   ================================================================ */

.dashboard-table__date {
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  white-space: nowrap;
}


/* ================================================================
   ACTIONS
   ================================================================ */

.dashboard-table__actions-heading,
.dashboard-table__actions {
  text-align: left;
}

.dashboard-table__actions {
  min-width: 120px;
  white-space: nowrap;
}

.dashboard-actions {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}


/* ================================================================
   MOBILE
   ================================================================ */

@media (max-width: 767.98px) {

  .dashboard-table {
    min-width: 650px;
  }

  .dashboard-table td,
  .dashboard-table__head th {
    padding: var(--space-3);
  }

}
</style>