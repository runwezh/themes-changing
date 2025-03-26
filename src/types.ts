// 主题切换状态枚举
export enum SwitchStatus {
    NotSet = 'notset',
    Running = 'running',
    Paused = 'stopped'
}

// 主题切换模式
export type SwitchMode = 'interval' | 'time'; 