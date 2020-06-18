<template>
    <span>Count: {{count}}</span>
    <button @click="count++">Add One</button>
</template>

<script>
    import "./count.css"
    
    export default {
        data: () => ({count: 0})
    }
</script>
