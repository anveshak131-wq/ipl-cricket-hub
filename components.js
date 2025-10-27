// Reusable Component Library

class ComponentLibrary {
    constructor() {
        this.modals = [];
        this.toasts = [];
    }

    // Modal Component
    createModal(id, content, options = {}) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="componentLibrary.closeModal('${id}')"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="componentLibrary.closeModal('${id}')">&times;</button>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        this.modals.push(id);
        return modal;
    }

    showModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('modal-active');
        }
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('modal-active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    // Toast Notification
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('toast-show'), 100);
        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        this.toasts.push(toast);
    }

    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Loading Spinner
    showLoading(container) {
        const loading = document.createElement('div');
        loading.className = 'loading-container';
        loading.innerHTML = '<div class="spinner"></div><p>Loading...</p>';
        container.appendChild(loading);
        return loading;
    }

    hideLoading(loading) {
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => loading.remove(), 300);
        }
    }

    // Team Card Generator
    createTeamCard(team) {
        return `
            <div class="team-card animate-on-scroll" data-team="${team.shortName}">
                <div class="team-card-inner">
                    <div class="team-card-front">
                        <img src="${team.logo}" alt="${team.name}" class="team-logo">
                        <h3 class="team-name">${team.shortName}</h3>
                        <p class="team-info">${team.name}</p>
                    </div>
                    <div class="team-card-back">
                        <p>${team.description}</p>
                        <button class="btn-primary" onclick="window.location='${team.page}'">
                            View Team
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Match Card Generator
    createMatchCard(match) {
        const statusClass = match.status;
        return `
            <div class="match-card ${statusClass} animate-on-scroll">
                <div class="match-header">
                    <span class="match-number">Match #${match.number}</span>
                    <span class="status ${statusClass}">${statusClass}</span>
                </div>
                <div class="teams">
                    <div class="team">
                        <img src="${match.team1.logo}" alt="${match.team1.shortName}" class="team-logo">
                        <span class="team-name">${match.team1.shortName}</span>
                        <div class="score">${match.team1.score}</div>
                    </div>
                    <span class="vs-text">VS</span>
                    <div class="team">
                        <img src="${match.team2.logo}" alt="${match.team2.shortName}" class="team-logo">
                        <span class="team-name">${match.team2.shortName}</span>
                        <div class="score">${match.team2.score}</div>
                    </div>
                </div>
                <div class="match-info">
                    <span><i class="fas fa-map-marker-alt"></i> ${match.venue}</span>
                    <span><i class="fas fa-clock"></i> ${match.time}</span>
                </div>
            </div>
        `;
    }

    // Table Row Generator
    createPointsRow(team, position) {
        return `
            <tr class="animate-on-scroll">
                <td><span class="position">${position}</span></td>
                <td>
                    <div class="team-info">
                        <img src="${team.logo}" alt="${team.shortName}" class="team-logo-small">
                        <span class="team-name">${team.shortName}</span>
                    </div>
                </td>
                <td>${team.played}</td>
                <td>${team.won}</td>
                <td>${team.lost}</td>
                <td>${team.points}</td>
                <td><span class="nrr ${team.nrr >= 0 ? 'positive' : 'negative'}">${team.nrr.toFixed(3)}</span></td>
            </tr>
        `;
    }

    // Filter Component
    createFilter(options) {
        return `
            <div class="filter-group">
                <label><i class="${options.icon}"></i> ${options.label}</label>
                <select id="${options.id}" onchange="${options.onchange}">
                    ${options.options.map(opt => 
                        `<option value="${opt.value}">${opt.text}</option>`
                    ).join('')}
                </select>
            </div>
        `;
    }
}

// Initialize component library
const componentLibrary = new ComponentLibrary();
window.componentLibrary = componentLibrary;

