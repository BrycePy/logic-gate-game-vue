<script setup>
import 'bootstrap/dist/css/bootstrap.css'
import '../assets/main.css';
import { onMounted } from 'vue';
import { mountApp, getCallerArgs } from '../libs/utils';
import WorldSelection from '../pages/WorldSelection.vue';

onMounted(() => {
    let urlUpToHash = window.location.href.split('#')[0];
    let newUrl = urlUpToHash + '#main-menu';
    window.history.pushState({}, '', newUrl);

    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', () => {
        mountApp(WorldSelection);
    }, { once: true });
})

</script>

<template>
    <!-- <main> -->
    <div class="app-inner">
        <img alt="Vue logo" class="logo" src="/logowhite.png" />
    
        <div class="d-flex justify-content-center">
            <a class="start-btn" id="start-btn">
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
    width: 300px;
    margin-left: auto;
    margin-right: auto;
}

@media (min-width: 600px) {
    .logo {
        width: 500px;
    }
}

@media (min-width: 1024px) {
    .logo {
        width: 800px;
    }

    header .wrapper {
        display: flex;
        place-items: flex-start;
        flex-wrap: wrap;
    }
}

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
