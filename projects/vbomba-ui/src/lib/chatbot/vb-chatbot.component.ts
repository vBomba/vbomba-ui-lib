import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { VbButtonComponent } from '../button/vb-button.component';
import { VbTextLoaderComponent } from '../text-loader/vb-text-loader.component';
import { VbChatbotMessage } from './vb-chatbot-message';

@Component({
  selector: 'vb-chatbot',
  standalone: true,
  imports: [VbButtonComponent, VbTextLoaderComponent],
  templateUrl: './vb-chatbot.component.html',
  styleUrl: './vb-chatbot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbChatbotComponent {
  readonly title = input('Assistant');
  readonly placeholder = input('Write a message...');
  readonly loading = input(false);
  readonly loadingText = input('Assistant is typing');
  readonly messages = input<VbChatbotMessage[]>([]);
  readonly sendAriaLabel = input('Send message');

  readonly send = output<string>();

  protected readonly draft = signal('');
  protected readonly canSend = computed(() => this.draft().trim().length > 0 && !this.loading());

  protected onDraftInput(value: string): void {
    this.draft.set(value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  protected submit(): void {
    if (!this.canSend()) {
      return;
    }
    this.send.emit(this.draft().trim());
    this.draft.set('');
  }
}
