document.addEventListener("DOMContentLoaded", function() {

    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    function validateUsername(username) {
        if(username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if(!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {
        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;
            statsContainer.classList.remove("none");

           const proxyUrl  = "https://cors-anywhere.com/"
            const targetUrl = 'https://leetcode.com/graphql/';

            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: `
                    query userSessionProgress($username: String!) {
                      allQuestionsCount {
                        difficulty
                        count
                      }
                      matchedUser(username: $username) {
                        submitStats {
                          acSubmissionNum {
                            difficulty
                            count
                            submissions
                          }
                          totalSubmissionNum {
                            difficulty
                            count
                            submissions
                          }
                        }
                      }
                    }`,
                variables: { "username": `${username}` }
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if (!response.ok) throw new Error("Unable to fetch the User details");

            const parsedData = await response.json();
            displayUserData(parsedData);

        } catch (error) {
            statsContainer.innerHTML = `<p>${error.message}</p>`;
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(data) {
        const totalEasy = data.data.allQuestionsCount[1].count;
        const totalMedium = data.data.allQuestionsCount[2].count;
        const totalHard = data.data.allQuestionsCount[3].count;

        const solvedEasy = data.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedMedium = data.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedHard = data.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedEasy, totalEasy, easyLabel, easyProgressCircle);
        updateProgress(solvedMedium, totalMedium, mediumLabel, mediumProgressCircle);
        updateProgress(solvedHard, totalHard, hardLabel, hardProgressCircle);

        const cardsData = [
            { label: "Total Submissions", value: data.data.matchedUser.submitStats.totalSubmissionNum[0].submissions },
            { label: "Easy Submissions", value: data.data.matchedUser.submitStats.totalSubmissionNum[1].submissions },
            { label: "Medium Submissions", value: data.data.matchedUser.submitStats.totalSubmissionNum[2].submissions },
            { label: "Hard Submissions", value: data.data.matchedUser.submitStats.totalSubmissionNum[3].submissions },
        ];

        cardStatsContainer.innerHTML = cardsData.map(card =>
            `<div class="card">
                <h4>${card.label}</h4>
                <p>${card.value}</p>
            </div>`
        ).join("");
    }

    searchButton.addEventListener('click', function() {
        const username = usernameInput.value;
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });

});
