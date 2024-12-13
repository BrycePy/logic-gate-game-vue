<script setup>
import 'bootstrap/dist/css/bootstrap.css'
import { onMounted } from 'vue';
import { mountApp, getCallerArgs } from '../libs/utils';
import WorldSelection from '../pages/WorldSelection.vue';
import { hintCursor, setTitle } from '@/main';


onMounted(() => {
    console.log('mounted')
    let urlUpToHash = window.location.href.split('#')[0];
    let newUrl = urlUpToHash + '#main-menu';
    window.history.pushState({}, '', newUrl);
    setTitle();

    const startBtn = $('.start-btn')[0];
    hintCursor.clear();
    hintCursor.add({
        element: startBtn,
        animation: 'click'
    });
})

</script>

<template>
    <!-- <main> -->
    <div class="app-inner">
        <img alt="Vue logo" class="logo" src="/logowhite.png" />
    
        <div class="d-flex justify-content-center">
            <a class="start-btn" id="start-btn" @click="mountApp(WorldSelection)">
                <img src="../assets/play.svg" class="start-btn-img" viewBox="0 0 16 16"></img>
            </a>
        </div>
    </div>
</template>

<style scoped>
header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
}

.logo {
    display: block;
    /* width: 450px; */
    max-width: 1000px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
}

.app-inner {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0;
}

/* @media (min-width: 600px) {
    .logo {
        width: 500px;
    }
}

@media (min-width: 1024px) {
    .logo {
        width: 800px;
    }
} */

.start-btn {
    position: relative;
    width: 100px;
    height: 100px;
    margin: 1em;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    border: 1px solid #888;
}

.start-btn:hover {
    background-color: rgba(0, 0, 0, 0.6);
    cursor: pointer;
    width: 105px;
    height: 105px;
}

.start-btn-img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-45%, -50%);
    width: 75px;
    height: 75px;
}
</style>
